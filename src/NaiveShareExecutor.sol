// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IB20Asset} from "base-std/interfaces/IB20Asset.sol";

/// @notice Research fixture: models quoting UI units at authorization and executing raw units later.
/// @dev Deliberately explicit baseline, not evidence of a bug in an existing production application.
contract NaiveShareExecutor {
    error InvalidOrder();
    error TransferFailed();

    struct Order {
        address owner;
        IB20Asset asset;
        address recipient;
        uint256 cachedRaw;
    }

    uint256 public nextId;
    mapping(uint256 => Order) public orders;

    function authorizeUI(IB20Asset asset, address recipient, uint256 uiAmount) external returns (uint256 id) {
        id = nextId++;
        orders[id] = Order(msg.sender, asset, recipient, asset.toRawBalance(uiAmount));
    }

    function execute(uint256 id) external returns (uint256 rawSpent) {
        Order memory order = orders[id];
        if (order.owner != msg.sender) revert InvalidOrder();
        delete orders[id];
        rawSpent = order.cachedRaw;
        if (!order.asset.transferFrom(order.owner, order.recipient, rawSpent)) revert TransferFailed();
    }
}
