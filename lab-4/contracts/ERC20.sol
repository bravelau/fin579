pragma solidity 0.8.8;

contract ERC20{
    string _name;

    function getName() public view returns (string memory){
        return _name;
    }

    function setName(string memory name) public returns (string memory) {
        return _name = name;
    }

    function totalSupply() public view returns (uint256) {
        return 10000;
    }


    constructor (string memory name){
        _name = name;
    }
}