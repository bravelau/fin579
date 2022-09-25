const { ethers } = require("hardhat");

(async () => {
    // contract address obtained from etherscan after deployment
    const contractAddr = '0x8e4fB3E962bC36b44E26e9CF8357ff7223879941';

    // get the accounts
    const accounts = await ethers.getSigners();

    // get the contract
    const contract = await ethers.getContractAt('TutorialERC20', contractAddr); 
    
    // get token name
    let response = await contract.name();        
    console.log(response);

    // get token symbol
    response = await contract.symbol();
    console.log(response);

    // get balance of accounts[0]
    let before = await contract.balanceOf(accounts[0].address);
    console.log(before);

    // mint 1 WNDRS
    response = await contract.mint(accounts[0].address, ethers.utils.parseUnits('1', 'ether'));
    await response.wait();

    // get balance of account[0]
    let after = await contract.balanceOf(accounts[0].address);
    console.log(after);

})().catch((err)=>console.error(err));


