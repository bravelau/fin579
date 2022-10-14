const { ethers } = require("hardhat");

(async () => {
    // get accounts
    const accounts = await ethers.getSigners();

    // token contract address
    const contractAddr = '0xDD0b177d109A5E11417b16D5a01Efe61893B0C55';
    // get the contract
    const factory = await ethers.getContractFactory("Crowdsale");

    const crowdSale = await factory.deploy (contractAddr, 100, accounts[0].address);

    console.log("crowdSale contract address:", crowdSale.address);
})().catch((err)=>console.error(err));
