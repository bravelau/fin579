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

    event Transfer (address to, uint256 amount);

    function transfer (address to, uint256 amount) public {
        require (msg.sender == _owner, "Non owner of contract");
        address payable receiver = payable (to);
        receiver.transfer(amount);
    }
}