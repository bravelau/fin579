const { ethers } = require("hardhat");

(async () => {
    // contract address obtained from etherscan after deployment
    const contractAddr = '0x8e4fB3E962bC36b44E26e9CF8357ff7223879941';

    // get the accounts
    const accounts = await ethers.getSigners();

    // get the contract
    const contract = await ethers.getContractAt('TutorialERC20', contractAddr); 
    
    // get balance before transfer
    let beforeFrom = await contract.balanceOf(accounts[0].address);
    let beforeTo = await contract.balanceOf(accounts[1].address);
    console.log("balance of From account before transfer", beforeFrom);
    console.log("balance of To account before transfer", beforeTo);

    // transfer 0.5 WNDRS token to accounts[1]
    let response = await contract.transfer(accounts[1].address, ethers.utils.parseUnits('0.5', 'ether'));

    // wait for the recept
    let receipt = await response.wait();

    // look for transfer event
    const transfer = receipt.events.find((x) => x.event === "Transfer");
    console.log(transfer.args._from);
    console.log(transfer.args._to);
    console.log(transfer.args._value);

    // get balance after transfer
    let afterFrom = await contract.balanceOf(accounts[0].address);
    let afterTo = await contract.balanceOf(accounts[1].address);
    console.log("balance of From account after transfer", afterFrom);
    console.log("balance of To account after transfer", afterTo);

})().catch((err)=>console.error(err));


