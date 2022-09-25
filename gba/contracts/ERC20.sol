pragma solidity 0.8.8;

contract ERC20{
    string _name;
    string _symbol;
    uint256 _totalSupply;
    mapping(address=>uint256) _balanceOf;
    mapping (address=>mapping(address=>uint256)) _allowance;

    event Transfer (address indexed _from, address indexed _to, uint256 _value);
    event Approval (address indexed _owner, address indexed _spender, uint256 _value);

    function name() public view returns (string memory){
        return _name;
    }

    function symbol() public view returns (string memory){
       return _symbol;
    }

    function decimals() public pure returns (uint8){
        return 18;
    }
   
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256){
        return _balanceOf[_owner];
    }

    function allowance(address _owner, address _spender) public view returns (uint256){
        return _allowance[_owner][_spender];
    }

    function transfer(address _to, uint256 _value) external returns (bool success){
        uint256 fromBalance = _balanceOf[msg.sender];

        require(fromBalance >= _value, "Insufficient balance");

        _balanceOf[msg.sender] = fromBalance - _value;
        _balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success){
        address spender = msg.sender;

        uint256 currentAllowance = _allowance[_from][spender];

        require (currentAllowance >= _value, "Insufficient Allowance");

        _allowance[_from][spender] = currentAllowance - _value; 

        uint256 fromBalance = _balanceOf[_from];

        require (fromBalance >= _value, "Insufficient balance");

        _balanceOf[_from] = fromBalance - _value;
        _balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success){
       address owner = msg.sender;
       
       _allowance[owner][_spender] = _value;
       
       emit Approval(owner, _spender, _value);

       return true;    
    }


    constructor (string memory name_, string memory symbol_, uint256 totalSupply_, address owner_){
        _name = name_;
        _symbol = symbol_;
        _totalSupply = totalSupply_;
        _balanceOf[owner_] = totalSupply_;
    }
}