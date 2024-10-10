// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DannyToken is ERC20 {
    constructor() ERC20("DannyToken", "DNT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
