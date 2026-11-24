// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @notice The subset of Foundry cheatcodes these tests use. Declared inline so
/// the repo needs no forge-std git submodule.
interface Vm {
    function deal(address account, uint256 newBalance) external;
    function prank(address msgSender) external;
    function expectRevert(bytes calldata revertData) external;
    function assume(bool condition) external pure;
    function load(address target, bytes32 slot) external view returns (bytes32);
    function envOr(string calldata name, uint256 defaultValue) external view returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

abstract contract CheatCodes {
    // `vm` is the Foundry convention for the cheatcode handle.
    // forge-lint: disable-next-line(screaming-snake-case-const)
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}
