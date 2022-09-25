pragma solidity 0.8.8;
import './MintableERC20.sol';
import './Ownable.sol';

contract TutorialERC20 is MintableERC20, Ownable{
    constructor(string memory name_, string memory symbol_, address owner_)
        MintableERC20(name_, symbol_)
        Ownable(owner_)
    {

    }

    function mint(address to, uint256 amount) override
    onlyOwner
    public
    {
        _totalSupply += amount;
        _balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}
