const { ethers } = require("hardhat");

(async () => {
    // contract address obtained from etherscan after deployment
    // update this to your contract address
    const contractAddr = '0xDD0b177d109A5E11417b16D5a01Efe61893B0C55';

    // get the accounts
    const accounts = await ethers.getSigners();

    // owner address of the token contract
    const ownerAddr = accounts[0].address;

    // get the contract
    const contract = await ethers.getContractAt('AssignmentERC20', contractAddr); 
    
    // get token name
    let response = await contract.name();        
    console.log(response);

    // get token symbol
    response = await contract.symbol();
    console.log(response);

    // get balance of owner of the token contract
    let before = await contract.balanceOf(ownerAddr);
    console.log(before);

    // mint more tokens 
    let mintAmt = 1000000000;

    response = await contract.mint(accounts[0].address, ethers.utils.parseUnits(mintAmt.toString(), 'ether'));
    await response.wait();

    // get balance of account[0]
    let after = await contract.balanceOf(ownerAddr);
    console.log(after);

})().catch((err)=>console.error(err));


