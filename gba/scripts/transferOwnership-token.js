const { ethers } = require("hardhat");

(async () => {
    // get accounts
    const accounts = await ethers.getSigners();

    // token contract address
    const tokenContractAddr = '0xDD0b177d109A5E11417b16D5a01Efe61893B0C55';
    const crowdSaleContractAddr = '0x71976E5ef614d759189fbD77C8F789aCF97763A9';

    // get the contract
    const factory = await ethers.getContractFactory("AssignmentERC20");

    const wndr = await factory.attach(tokenContractAddr);

    const balance = await wndr.balanceOf(accounts[0].address);
    
    wndr.transferOwnership(crowdSaleContractAddr);

    console.log("token contract ownership transferred");

    
})().catch((err)=>console.error(err));