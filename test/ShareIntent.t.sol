// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {SpikeBase} from "./SpikeBase.sol";
import {console2} from "forge-std/console2.sol";
import {NaiveShareExecutor} from "../src/NaiveShareExecutor.sol";
import {IntentShareExecutor} from "../src/IntentShareExecutor.sol";

/// @notice Current-B20 semantics exercised through legacy helpers on the pinned current reference mock.
/// No scheduled updates, future aliases, fork, signatures or trading integrations in this suite.
contract ShareIntentTest is SpikeBase {
    NaiveShareExecutor internal naive;
    IntentShareExecutor internal intent;
    address internal carol = makeAddr("carol");

    function setUp() public override {
        super.setUp();
        naive = new NaiveShareExecutor();
        intent = new IntentShareExecutor();
        vm.startPrank(alice);
        token.approve(address(naive), 100e18);
        token.approve(address(intent), 100e18);
        vm.stopPrank();
    }

    function _authorize(address recipient, IntentShareExecutor.Unit unit, uint256 amount, uint256 cap)
        internal
        returns (uint256)
    {
        vm.prank(alice);
        return intent.authorize(asset(), recipient, unit, amount, cap);
    }

    function _execute(uint256 id) internal returns (uint256) {
        vm.prank(alice);
        return intent.execute(id);
    }

    function test_executionTimeIntentStaleQuote() public {
        uint256 requestedUI = 2e18;
        uint256 quote = asset().toRawBalance(requestedUI);
        vm.prank(alice);
        uint256 naiveId = naive.authorizeUI(asset(), bob, requestedUI);
        uint256 intentId = _authorize(carol, IntentShareExecutor.Unit.ExecutionTimeShares, requestedUI, 3e18);
        assertEq(quote, 2e18);

        _updateMultiplier(4e18);
        assertEq(token.balanceOf(alice), 100e18, "Corporate action must not rewrite raw balances");
        vm.prank(alice);
        uint256 naiveRaw = naive.execute(naiveId);
        uint256 intentRaw = _execute(intentId);
        uint256 naiveUI = asset().scaledBalanceOf(bob);
        uint256 intentUI = asset().scaledBalanceOf(carol);
        assertEq(token.balanceOf(bob), naiveRaw);
        assertEq(token.balanceOf(carol), intentRaw);
        assertEq(naiveRaw, 2e18);
        assertEq(naiveUI, 8e18);
        assertNotEq(naiveUI, requestedUI, "Cached conversion must violate execution-time UI intent");
        assertEq(intentRaw, 0.5e18);
        assertEq(intentUI, requestedUI);
        assertEq(token.balanceOf(alice), 97.5e18);

        _log("execution-time shares / cached baseline", requestedUI, 0, quote, 0, naiveRaw, naiveUI);
        console2.log("PASS: baseline delivers 8 UI instead of requested 2; mismatch reproduced.");
        _log("execution-time shares / atomic conversion", requestedUI, 0, quote, 3e18, intentRaw, intentUI);
        console2.log("PASS: execution-time official helper + transfer delivers exactly 2 UI.");
    }

    function test_signingTimeIntent() public {
        uint256 lockedRaw = asset().toRawBalance(2e18);
        uint256 id = _authorize(bob, IntentShareExecutor.Unit.SigningTimePosition, 2e18, 3e18);
        _updateMultiplier(4e18);
        uint256 rawSpent = _execute(id);
        assertEq(rawSpent, lockedRaw);
        assertEq(token.balanceOf(bob), 2e18);
        assertEq(token.balanceOf(alice), 98e18);
        assertEq(asset().scaledBalanceOf(bob), 8e18);
        assertEq(asset().toRawBalance(2e18), 0.5e18, "Execution-time semantics would transfer a different raw position");
        _log(
            "signing-time position / fixed raw entitlement",
            2e18,
            lockedRaw,
            lockedRaw,
            3e18,
            rawSpent,
            asset().scaledBalanceOf(bob)
        );
        console2.log("PASS: 2 raw / 8 UI preserves the original raw entitlement, not a guaranteed dollar value.");
    }

    function test_reverseSplitRespectsMaxSpend() public {
        uint256 quote = asset().toRawBalance(2e18);
        uint256 id = _authorize(bob, IntentShareExecutor.Unit.ExecutionTimeShares, 2e18, 3e18);
        _updateMultiplier(0.25e18);
        uint256 requiredRaw = asset().toRawBalance(2e18);
        assertEq(requiredRaw, 8e18);
        uint256 allowanceBefore = token.allowance(alice, address(intent));
        vm.expectRevert(abi.encodeWithSelector(IntentShareExecutor.MaxRawSpendExceeded.selector, 8e18, 3e18));
        vm.prank(alice);
        intent.execute(id);
        assertEq(token.balanceOf(alice), 100e18);
        assertEq(token.balanceOf(bob), 0);
        assertEq(token.allowance(alice, address(intent)), allowanceBefore);
        _log("execution-time shares / capped reverse split", 2e18, 0, quote, 3e18, 0, 0);
        _number("required raw transfer (rejected):", requiredRaw);
        console2.log("PASS: exact MaxRawSpendExceeded(8e18, 3e18) revert; balances and allowance unchanged.");
    }

    function test_reverseSplitSufficientCapSucceeds() public {
        uint256 quote = asset().toRawBalance(2e18);
        uint256 id = _authorize(bob, IntentShareExecutor.Unit.ExecutionTimeShares, 2e18, 8e18);
        _updateMultiplier(0.25e18);
        uint256 rawSpent = _execute(id);
        assertEq(rawSpent, 8e18);
        assertEq(token.balanceOf(bob), 8e18);
        assertEq(token.balanceOf(alice), 92e18);
        assertEq(asset().scaledBalanceOf(bob), 2e18);
        _log(
            "execution-time shares / sufficient reverse-split cap",
            2e18,
            0,
            quote,
            8e18,
            rawSpent,
            asset().scaledBalanceOf(bob)
        );
        console2.log("PASS: authorized 8 raw cap permits delivery of 2 UI.");
    }

    function test_rawTokenInstructionUnaffected() public {
        uint256 id = _authorize(bob, IntentShareExecutor.Unit.RawTokens, 2e18, 2e18);
        _updateMultiplier(4e18);
        uint256 rawSpent = _execute(id);
        assertEq(rawSpent, 2e18);
        assertEq(token.balanceOf(bob), 2e18);
        assertEq(token.balanceOf(alice), 98e18);
        assertEq(asset().scaledBalanceOf(bob), 8e18);
        _log("raw tokens / no UI promise", 0, 2e18, 0, 2e18, rawSpent, asset().scaledBalanceOf(bob));
        console2.log("PASS: exactly 2 raw delivered; changed UI representation does not violate raw intent.");
    }

    function test_noMultiplierChangeBothPathsAgree() public {
        vm.prank(alice);
        uint256 naiveId = naive.authorizeUI(asset(), bob, 2e18);
        uint256 id = _authorize(carol, IntentShareExecutor.Unit.ExecutionTimeShares, 2e18, 3e18);
        vm.prank(alice);
        uint256 naiveRaw = naive.execute(naiveId);
        uint256 intentRaw = _execute(id);
        assertEq(naiveRaw, 2e18);
        assertEq(intentRaw, naiveRaw);
        assertEq(asset().scaledBalanceOf(bob), 2e18);
        assertEq(asset().scaledBalanceOf(carol), 2e18);
        _log(
            "execution-time shares / unchanged multiplier control",
            2e18,
            0,
            2e18,
            3e18,
            intentRaw,
            asset().scaledBalanceOf(carol)
        );
        console2.log("PASS: both paths deliver 2 raw / 2 UI when multiplier stays unchanged.");
    }

    function test_exactIntentRejectsUnrepresentableRounding() public {
        uint256 id = _authorize(bob, IntentShareExecutor.Unit.ExecutionTimeShares, 2e18, 3e18);
        _updateMultiplier(3e18);
        uint256 roundedRaw = asset().toRawBalance(2e18);
        uint256 deliverableUI = asset().toScaledBalance(roundedRaw);
        assertEq(roundedRaw, 666666666666666666);
        assertEq(deliverableUI, 1999999999999999998);
        vm.expectRevert(
            abi.encodeWithSelector(IntentShareExecutor.AmountNotRepresentable.selector, 2e18, deliverableUI)
        );
        vm.prank(alice);
        intent.execute(id);
        assertEq(token.balanceOf(alice), 100e18);
        assertEq(token.balanceOf(bob), 0);
        _log("execution-time shares / exactness guard", 2e18, 0, 2e18, 3e18, 0, 0);
        _number("official helper rounded raw amount:", roundedRaw);
        _number("official helper deliverable UI (rejected):", deliverableUI);
        console2.log(
            "PASS: floors lose 2 UI base units; EXACT instruction reverts instead of silently underdelivering."
        );
    }
}
