 const { ethers } = require("hardhat");

(async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.deploy("ERC20");
    await erc20.deployed();
})().catch((err)=>console.error(err));


