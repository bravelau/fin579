const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// uniswap v2 factory contract address
// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/factory
const uniswapFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

// uniswap v2 router contract address
// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02
const uniswapRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

// WNDR token contract address
const wndrAddr = "0xDD0b177d109A5E11417b16D5a01Efe61893B0C55";

// CHRON token contract address
const chronAddr = "0xDd6010412b61570bd6f0101460bb80bDbE103E28";

// Liquidity pool address
const pairAddr = "0x2C423E5c531c1c5b5743119242Feb14006d75268"

const getAbi = (filename) =>{
    try{
        const dir = path.resolve (
            __dirname,
            filename,
        );

        const file = fs.readFileSync(dir, "utf8");

        const json = JSON.parse(file);
              
        return json;
    }catch(err){
        console.error(err);
    };
};

const tokenApprove = async (token, uniswap, amount) => {
    const symbol = await token.symbol();
    let response = await token.approve(uniswap.address, amount);
    let receipt = await response.wait();
    let approval = receipt.events.find((x) => x.event == "Approval");
    console.log (`${symbol} approve`, approval.args.value);
};

(async () => {
    // get account
    const account = await ethers.getSigner();

    // get WNDR token contract
    const wndr = await ethers.getContractAt("AssignmentERC20", wndrAddr);

    // get CHRON token contract
    const chron = await ethers.getContractAt(getAbi("Chronium-abi.json"), chronAddr);

    // get Uniswap V2 ffacotry contract
    const uniswapFactory = await ethers.getContractAt(getAbi("uniswapfactory-abi.json"), uniswapFactoryAddr);

    // get Uniswap V2 router contract
    const uniswap = await ethers.getContractAt(getAbi("uniswaprouter-abi.json"), uniswapRouterAddr);

    let wndrLiquidity = 200000;
    let chronLiquidity = 10000;

    await tokenApprove (wndr, uniswap, wndrLiquidity);

    await tokenApprove (chron, uniswap, chronLiquidity); 

    // create the liquidity pool containing WNDR and CHRON
    const ts = (await ethers.provider.getBlock()).timestamp + 100
       
    await uniswap.addLiquidity(
            wndr.address,
            chron.address,
            wndrLiquidity,
            chronLiquidity,
            0,
            0,
            account.address,
            ts
       );
})().catch((err)=>console.error(err));


