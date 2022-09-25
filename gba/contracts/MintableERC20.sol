pragma solidity 0.8.8;
import './ERC20.sol';

contract MintableERC20 is ERC20 {

    constructor (string memory name_, string memory symbol_)
        ERC20(name_, symbol_, 0, address(0)){

        }
    
    function mint(address to, uint256 amount) virtual public{
        _totalSupply += amount;
        _balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}