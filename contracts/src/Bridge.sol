// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Bridge {
    using SafeERC20 for IERC20;

    event TokenLocked(
        address indexed token,
        address indexed user,
        uint256 amount
    );
    event TokenClaimed(
        address indexed token,
        address indexed user,
        uint256 amount
    );
    event TokenBurned(
        address indexed token,
        address indexed user,
        uint256 amount
    );
    event TokenReleased(
        address indexed token,
        address indexed user,
        uint256 amount
    );

    mapping(address => mapping(address => uint256)) public lockedTokens;

    function lockTokens(address token, uint256 amount) external {
        lockedTokens[token][msg.sender] += amount;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit TokenLocked(token, msg.sender, amount);
    }

    function claimTokens(address token, uint256 amount) external {
        require(
            lockedTokens[token][msg.sender] >= amount,
            "Insufficient locked tokens"
        );
        lockedTokens[token][msg.sender] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit TokenClaimed(token, msg.sender, amount);
    }

    function burnTokens(address token, uint256 amount) external {
        require(
            lockedTokens[token][msg.sender] >= amount,
            "Insufficient locked tokens"
        );
        lockedTokens[token][msg.sender] -= amount;
        emit TokenBurned(token, msg.sender, amount);
    }

    function releaseTokens(address token, uint256 amount) external {
        IERC20(token).safeTransfer(msg.sender, amount);
        emit TokenReleased(token, msg.sender, amount);
    }
}
