const { ethers } = require("hardhat");

(async () => {
    // get accounts
    const accounts = await ethers.getSigners();

    // get the contract
    const factory = await ethers.getContractFactory("TutorialERC20");

    // deploy the contract, token name "Wonders", token symbol "WNDRS", owner accounts[0]
    const wonders = await factory.deploy(
        "Wonders",
        "WNDRS",
        accounts[0].address);

    await wonders.deployed();
})().catch((err)=>console.error(err));


