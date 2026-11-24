// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {BankV1} from "../BankV1.s.sol";
import {CheatCodes} from "../test/Vm.sol";

/// Deploys BankV1.
///   anvil &
///   PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
///     forge script contracts/script/DeployBankV1.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
/// The default key is Anvil's first dev account; never use it on a real network.
contract DeployBankV1 is CheatCodes {
    uint256 internal constant ANVIL_KEY_0 = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    function run() external returns (BankV1 bank) {
        vm.startBroadcast(vm.envOr("PRIVATE_KEY", ANVIL_KEY_0));
        bank = new BankV1();
        vm.stopBroadcast();
    }
}
