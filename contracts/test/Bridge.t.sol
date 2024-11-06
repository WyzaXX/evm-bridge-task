// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "forge-std/Test.sol";
import "../src/Bridge.sol";
import "../src/WrappedToken.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

contract BridgeTest is Test {
    Bridge bridge;
    MockERC20 token;
    WrappedToken wrappedToken;
    address user = address(0x123);

    function setUp() public {
        wrappedToken = new WrappedToken();
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
        bridge.claimTokens(address(wrappedToken), 200 * 10 ** 18);
        assertEq(wrappedToken.balanceOf(user), 200 * 10 ** 18);
        vm.stopPrank();
    }

    function testBurnTokens() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        bridge.claimTokens(address(wrappedToken), 200 * 10 ** 18);
        bridge.burnTokens(address(wrappedToken), 200 * 10 ** 18);
        assertEq(wrappedToken.balanceOf(user), 0);
        vm.stopPrank();
    }

    function testBurnTokensInsufficientBalance() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        bridge.claimTokens(address(wrappedToken), 200 * 10 ** 18);
        vm.expectRevert("Insufficient burnable tokens");
        bridge.burnTokens(address(wrappedToken), 300 * 10 ** 18);
        vm.stopPrank();
    }

    function testReleaseTokens() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        bridge.releaseTokens(address(token), 200 * 10 ** 18);
        assertEq(token.balanceOf(user), 700 * 10 ** 18);
        assertEq(bridge.lockedTokens(address(token), user), 300 * 10 ** 18);
        vm.stopPrank();
    }

    function testReleaseTokensInsufficientLocked() public {
        vm.startPrank(user);
        token.approve(address(bridge), 500 * 10 ** 18);
        bridge.lockTokens(address(token), 500 * 10 ** 18);
        vm.expectRevert("Insufficient locked tokens");
        bridge.releaseTokens(address(token), 600 * 10 ** 18);
        vm.stopPrank();
    }
}
