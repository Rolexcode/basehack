// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {SpikeBase} from "./SpikeBase.sol";
import {Vm} from "forge-std/Vm.sol";
import {console2} from "forge-std/console2.sol";

/// @notice Cobalt reference/future behavior - NOT confirmed deployed Coinbase-stock behavior on Base mainnet.
contract CobaltMultiplierTest is SpikeBase {
    function test_cobaltActivationHasNoEvent() public {
        uint256 activationTime = block.timestamp + 1 hours;
        vm.recordLogs();
        _updateUIMultiplier(4e18, activationTime);
        Vm.Log[] memory scheduledLogs = vm.getRecordedLogs();
        assertEq(scheduledLogs.length, 1, "Record the actual scheduling event");
        assertEq(scheduledLogs[0].emitter, address(token));
        assertEq(scheduledLogs[0].topics.length, 1);
        assertEq(scheduledLogs[0].topics[0], keccak256("UIMultiplierUpdated(uint256,uint256,uint256)"));
        (uint256 oldM, uint256 newM, uint256 effective) = abi.decode(scheduledLogs[0].data, (uint256, uint256, uint256));
        assertEq(oldM, 1e18);
        assertEq(newM, 4e18);
        assertEq(effective, activationTime);

        // Explicitly model the deficient consumer: refresh current value when a token event arrives,
        // but do not schedule a refresh for the event's effective timestamp.
        uint256 eventOnlyCache = asset().uiMultiplier();
        assertEq(eventOnlyCache, oldM);
        assertEq(asset().newUIMultiplier(), newM);

        vm.recordLogs();
        vm.warp(activationTime - 1);
        assertEq(asset().uiMultiplier(), 1e18);
        vm.warp(activationTime);
        assertEq(asset().uiMultiplier(), 4e18);
        vm.warp(activationTime + 1);
        uint256 effectiveMultiplier = asset().uiMultiplier();
        Vm.Log[] memory activationLogs = vm.getRecordedLogs();
        assertEq(effectiveMultiplier, 4e18);
        assertEq(activationLogs.length, 0, "Time passage and read path must emit no activation logs");
        assertEq(eventOnlyCache, 1e18);
        assertNotEq(eventOnlyCache, effectiveMultiplier);
        // Positive control: using the captured event's timestamp is sufficient; no new event is needed.
        uint256 scheduleAwareCache = block.timestamp >= effective ? newM : oldM;
        assertEq(scheduleAwareCache, effectiveMultiplier);
        assertEq(token.balanceOf(alice), 100e18);
        assertEq(asset().balanceOfUI(alice), 400e18);

        console2.log("COBALT REFERENCE/FUTURE ONLY; no deployed Coinbase-stock claim.");
        _number("scheduling logs (actual captured):", scheduledLogs.length);
        _number("scheduled old multiplier:", oldM);
        _number("scheduled new multiplier:", newM);
        _number("scheduled effectiveAt:", effective);
        _number("activation-boundary logs (actual captured):", activationLogs.length);
        _number("event-only current-value cache:", eventOnlyCache);
        _number("effective onchain-reference multiplier:", effectiveMultiplier);
        _number("schedule-aware cache:", scheduleAwareCache);
        _number("raw transfer (none authorized):", 0);
        _number("UI delivery (none authorized):", 0);
        console2.log("PASS: lazy activation emitted zero logs; schedule-aware consumer remains correct.");
    }
}
