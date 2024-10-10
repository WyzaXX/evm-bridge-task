// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {Bridge} from "../src/Bridge.sol";

contract BridgeScript is Script {
    Bridge public bridge;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        bridge = new Bridge();
        vm.stopBroadcast();
    }
}
