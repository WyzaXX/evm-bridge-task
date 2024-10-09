// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedToken is ERC20 {
    constructor() ERC20("WrappedTokenDannyToken", "WDNT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
