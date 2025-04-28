// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Optional: if you want minting restricted

// Simple Mock ERC20 for testing purposes
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) Ownable(msg.sender) { // Set deployer as owner
         _decimals = decimals_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    // Function to allow the owner (deployer in tests) to mint tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}