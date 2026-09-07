// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {B20AssetTest} from "base-std-test/lib/B20AssetTest.sol";
import {IB20} from "base-std/interfaces/IB20.sol";
import {console2} from "forge-std/console2.sol";

abstract contract SpikeBase is B20AssetTest {
    function _deployToken() internal override returns (IB20) {
        return IB20(
            _createAsset(
                alice, keccak256("invariant-spike"), _assetParams("Reference Stock", "REF", admin, 18), new bytes[](0)
            )
        );
    }

    function setUp() public virtual override {
        super.setUp();
        assertFalse(livePrecompiles, "This spike must run locally in reference mode");
        assertEq(token.decimals(), 18);
        _mint(alice, 100e18);
        _grantOperator();
        assertEq(asset().multiplier(), 1e18);
    }

    function _number(string memory label, uint256 value) internal pure {
        console2.log(label, value);
    }

    // All amounts are integer base units, 18 decimals. No price oracle or dollars are modeled.
    function _log(
        string memory unit,
        uint256 uiAmount,
        uint256 authorizedRaw,
        uint256 cachedRaw,
        uint256 maxRaw,
        uint256 rawSpent,
        uint256 deliveredUI
    ) internal view {
        console2.log("authorized unit:", unit);
        _number("multiplier at authorization:", 1e18);
        _number("multiplier at execution:", asset().multiplier());
        _number("authorized UI amount (0 if N/A):", uiAmount);
        _number("authorized raw amount (0 if N/A):", authorizedRaw);
        _number("cached raw quote (0 if N/A):", cachedRaw);
        _number("maxRawSpend (0 if N/A):", maxRaw);
        _number("actual raw transfer:", rawSpent);
        _number("actual UI delivery:", deliveredUI);
    }
}
