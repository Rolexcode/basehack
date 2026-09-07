// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IB20Asset} from "base-std/interfaces/IB20Asset.sol";

/// @notice Bounded experiment, not a production order protocol. Authorization is an owner call, not EIP-712.
contract IntentShareExecutor {
    enum Unit {
        ExecutionTimeShares,
        SigningTimePosition,
        RawTokens
    }

    error InvalidOrder();
    error MaxRawSpendExceeded(uint256 required, uint256 maximum);
    error AmountNotRepresentable(uint256 requestedUI, uint256 deliverableUI);
    error TransferFailed();

    struct Order {
        address owner;
        IB20Asset asset;
        address recipient;
        Unit unit;
        uint256 amount;
        uint256 authorizedRaw;
        uint256 maxRawSpend;
    }

    uint256 public nextId;
    mapping(uint256 => Order) public orders;

    function authorize(IB20Asset asset, address recipient, Unit unit, uint256 amount, uint256 maxRawSpend)
        external
        returns (uint256 id)
    {
        uint256 authorizedRaw;
        if (unit == Unit.SigningTimePosition) authorizedRaw = asset.toRawBalance(amount);
        else if (unit == Unit.RawTokens) authorizedRaw = amount;
        id = nextId++;
        orders[id] = Order(msg.sender, asset, recipient, unit, amount, authorizedRaw, maxRawSpend);
    }

    function execute(uint256 id) external returns (uint256 rawSpent) {
        Order memory order = orders[id];
        if (order.owner != msg.sender) revert InvalidOrder();
        rawSpent = order.unit == Unit.ExecutionTimeShares ? order.asset.toRawBalance(order.amount) : order.authorizedRaw;
        if (rawSpent > order.maxRawSpend) revert MaxRawSpendExceeded(rawSpent, order.maxRawSpend);

        // The official helper floors division. An EXACT-share instruction must not silently underdeliver.
        // A later product could instead expose an explicitly authorized rounding tolerance.
        if (order.unit == Unit.ExecutionTimeShares) {
            uint256 deliverableUI = order.asset.toScaledBalance(rawSpent);
            if (deliverableUI != order.amount) revert AmountNotRepresentable(order.amount, deliverableUI);
        }
        delete orders[id];
        if (!order.asset.transferFrom(order.owner, order.recipient, rawSpent)) revert TransferFailed();
    }
}
