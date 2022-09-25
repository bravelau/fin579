pragma solidity 0.8.8;

contract Ownable{
    address private _owner;

    constructor (address owner_){
        _owner = owner_;
    }

    function owner() external view returns (address){
        return _owner;
    }

    modifier onlyOwner(){
        require (_owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function transferOwnership(address newOwner)
    public
    onlyOwner
    virtual
    {
        require (newOwner != address(0), "Ownable: new owner is the zero address");
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred (oldOwner, newOwner);
    }

}