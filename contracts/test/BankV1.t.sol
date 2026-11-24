// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {BankV1} from "../BankV1.s.sol";
import {CheatCodes} from "./Vm.sol";

contract BankV1Test is CheatCodes {
    BankV1 internal bank;
    address internal constant ALICE = address(0xA11CE);
    address internal constant BOB = address(0xB0B);
    uint256 internal constant PASSWORD = 42;

    function setUp() public {
        bank = new BankV1();
        vm.deal(ALICE, 100 ether);
        vm.prank(ALICE);
        bank.createAccount(PASSWORD);
    }

    function test_DepositRequiresActivatedAccount() public {
        vm.expectRevert(abi.encodeWithSignature("Error(string)", "Account is not activated yet"));
        bank.depositEther{value: 0}(BOB);
    }

    function test_DepositRequiresValue() public {
        vm.expectRevert(abi.encodeWithSignature("Error(string)", "No Ether sent"));
        bank.depositEther{value: 0}(ALICE);
    }

    function test_WithdrawRejectsWrongPassword() public {
        vm.prank(ALICE);
        bank.depositEther{value: 1 ether}(ALICE);
        vm.expectRevert(abi.encodeWithSignature("Error(string)", "Invalid password"));
        bank.withdrawEther(ALICE, PASSWORD + 1, 1 ether, BOB);
    }

    /// The bank is intentionally insecure: passwords live in public storage
    /// (mapping slot 1), so anyone can read one and drain the account.
    function test_PasswordIsReadableFromStorage() public {
        vm.prank(ALICE);
        bank.depositEther{value: 1 ether}(ALICE);
        bytes32 slot = keccak256(abi.encode(ALICE, uint256(1)));
        uint256 leaked = uint256(vm.load(address(bank), slot));
        require(leaked == PASSWORD, "password not at expected slot");

        bank.withdrawEther(ALICE, leaked, 1 ether, BOB);
        require(BOB.balance == 1 ether, "attacker did not receive funds");
    }

    /// Fuzz: any deposit followed by a withdrawal of at most that amount moves
    /// exactly `withdrawAmount` to the recipient; more than the balance reverts.
    function testFuzz_DepositWithdraw(uint96 depositAmount, uint96 withdrawAmount) public {
        vm.assume(depositAmount > 0);
        vm.deal(ALICE, depositAmount);
        vm.prank(ALICE);
        bank.depositEther{value: depositAmount}(ALICE);

        uint256 before = BOB.balance;
        if (withdrawAmount > depositAmount) {
            vm.expectRevert(abi.encodeWithSignature("Error(string)", "Amount to withdraw exceeds balance"));
            bank.withdrawEther(ALICE, PASSWORD, withdrawAmount, BOB);
        } else {
            bank.withdrawEther(ALICE, PASSWORD, withdrawAmount, BOB);
            require(BOB.balance - before == withdrawAmount, "wrong amount sent");
            require(address(bank).balance == uint256(depositAmount) - withdrawAmount, "bank balance drift");
        }
    }

    /// Fuzz: only the exact password unlocks a withdrawal.
    function testFuzz_WrongPasswordAlwaysReverts(uint256 guess) public {
        vm.assume(guess != PASSWORD);
        vm.prank(ALICE);
        bank.depositEther{value: 1 ether}(ALICE);
        vm.expectRevert(abi.encodeWithSignature("Error(string)", "Invalid password"));
        bank.withdrawEther(ALICE, guess, 1, BOB);
    }
}
