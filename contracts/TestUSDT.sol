// contracts/TestUSDT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDT is ERC20 {
    constructor() ERC20("Test USDT", "USDT") {
        _mint(msg.sender, 1000000 * 10**6); // Mint 1,000,000 USDT with 6 decimals
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 6; // USDT has 6 decimals
    }
    
    // Function to mint test tokens to any address (only for testing)
    function mintTestTokens(address to, uint256 amount) external {
        _mint(to, amount);
    }
}