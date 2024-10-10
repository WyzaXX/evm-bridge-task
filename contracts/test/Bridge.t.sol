// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Bridge} from "../src/Bridge.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract CounterTest is Test {
    Bridge public bridge;
    MockERC20 public token;
    address public user = address(0x123);

    function setUp() public {
        bridge = new Bridge();
        token = new MockERC20();
        token.mint(user, 1000 * 10 ** 18);
    }

    function testLockTokens() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        assertEq(bridge.lockedTokens(address(token), user), 500 * 10 ** 18);
        vm.stopPrank();
    }

    function testClaimTokens() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        bridge.claimTokens(address(token), 200 * 10 ** 18);
        assertEq(bridge.lockedTokens(address(token), user), 300 * 10 ** 18);
        assertEq(token.balanceOf(user), 700 * 10 ** 18);
        vm.stopPrank();
    }

    function testBurnTokens() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        bridge.burnTokens(address(token), 200 * 10 ** 18);
        assertEq(bridge.lockedTokens(address(token), user), 300 * 10 ** 18);
        vm.stopPrank();
    }

    function testReleaseTokens() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        bridge.releaseTokens(address(token), 200 * 10 ** 18);
        assertEq(token.balanceOf(user), 700 * 10 ** 18);
        vm.stopPrank();
    }
}
