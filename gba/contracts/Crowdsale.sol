pragma solidity 0.8.8;
import './AssignmentERC20.sol';

contract Crowdsale{
    uint256 _unitPrice;
    AssignmentERC20 _token;
    address _owner;


    constructor (AssignmentERC20 token, uint256 unitPrice, address owner){
        _token = token;
        _unitPrice = unitPrice;
        _owner = owner;
    }

    event Buy(address buyer, uint256 amount);
 
    function buy (uint256 amount) public payable {
        require(msg.value >= _unitPrice * amount, "Insufficient payment");
        address buyer = msg.sender;
        _token.mint (buyer, amount);

        emit Buy(buyer, amount);
    }

    event UnitPrice (uint256 unitprice);

    function adjustUnitPrice (uint256 unitPrice) public {
        require (msg.sender == _owner, "Non owner of contract");
        _unitPrice = unitPrice;

        emit UnitPrice (_unitPrice);
    }

    function getUnitPrice () public view returns (uint256 unitPrice) {
        return _unitPrice;
    }

    event Transfer (address to, uint256 amount);
    
    function transferEthOut (address to, uint256 amount) public payable {
        require (msg.sender == _owner, "Non owner of contract");
        address payable receiver = payable (to);
        receiver.transfer(amount);
    }

    function getEthBalance () public view returns (uint256 ethBalance){
        return address(this).balance;
    }
}