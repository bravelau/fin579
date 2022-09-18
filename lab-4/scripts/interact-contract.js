const { ethers } = require("hardhat");
const compiled = require('.././artifacts/contracts/ERC20.sol/ERC20.json');

(async () => {
    const account = await ethers.getSigner();

    const contractAddress = '0x2cc8e0b2209e11a08638f407a2c513920411ff26';

    const contract = new ethers.Contract(contractAddress, compiled.abi, account);

    const total = await contract.totalSupply();

    console.log(total);

    const name = await contract.getName();

    console.log(name);
    
})().catch((err)=>console.error(err));

