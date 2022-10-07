const { ethers } = require("hardhat");

(async () => {
    // contract address obtained from etherscan after deployment
    // update this to your contract address
    const contractAddr = '0xDD0b177d109A5E11417b16D5a01Efe61893B0C55';

    // get the accounts
    const accounts = await ethers.getSigners();

    const fromAddr = accounts[0].address;

    // update this to any address you want to send the token
    const toAddr = accounts[1].address;

    // get the contract
    const contract = await ethers.getContractAt('AssignmentERC20', contractAddr); 
    
    // get balance before transfer
    let beforeFrom = await contract.balanceOf(fromAddr);
    let beforeTo = await contract.balanceOf(toAddr);
    console.log("balance of From account before transfer", beforeFrom);
    console.log("balance of To account before transfer", beforeTo);

    // transfer X amount of token to toAddr
    // update this to any amount you want to transfer
    let transferAmt = 0.5;
    
    let response = await contract.transfer(toAddr, ethers.utils.parseUnits(transferAmt, 'ether'));

    // wait for the recept
    let receipt = await response.wait();

    // look for transfer event
    const transfer = receipt.events.find((x) => x.event === "Transfer");
    console.log(transfer.args._from);
    console.log(transfer.args._to);
    console.log(transfer.args._value);

    // get balance after transfer
    let afterFrom = await contract.balanceOf(fromAddr);
    let afterTo = await contract.balanceOf(toAddr);
    console.log("balance of From account after transfer", afterFrom);
    console.log("balance of To account after transfer", afterTo);

})().catch((err)=>console.error(err));


