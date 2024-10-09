// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {DannyToken} from "../src/contracts/DannyToken.sol";

contract DannyTokenScript is Script {
    DannyToken public dannyToken;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        dannyToken = new DannyToken();
        vm.stopBroadcast();
    }
}
