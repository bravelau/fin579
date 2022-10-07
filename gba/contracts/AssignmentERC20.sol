pragma solidity 0.8.8;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract AssignmentERC20 is ERC20, Ownable {
    constructor(string memory name_, string memory symbol_, address owner_) ERC20 (name_, symbol_) {

    }

    function mint (address account, uint256 amount)
    onlyOwner()
    public 
    returns (bool)
    {
        _mint(account, amount);

        return true;
    }
}