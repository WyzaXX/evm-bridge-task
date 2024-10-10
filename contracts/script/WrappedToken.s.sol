// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {WrappedToken} from "../src/WrappedToken.sol";

contract WrappedTokenScript is Script {
    WrappedToken public wrappedToken;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        wrappedToken = new WrappedToken();
        vm.stopBroadcast();
    }
}
