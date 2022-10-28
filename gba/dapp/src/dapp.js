//Fin579 GBA dapp.js 

import { ethers, BigNumber } from "ethers";
const CHRONIUM_ADDRESS = "0xDd6010412b61570bd6f0101460bb80bDbE103E28";
const DISTILLERY_ADDRESS = "0xa20f2c420f14418b580f60A4964727B66f34C88d";
const UNISWAPROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAPFACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const tokens = [
  {
    symbol: "WNDR",
    tokenAddress: "0xDD0b177d109A5E11417b16D5a01Efe61893B0C55",
  },
  {
    symbol: "EUG",
    tokenAddress: "0xb7DB396B0C0F6ec0dF13Ba7F5Dd22d718D30bA87",
  },
  {
   symbol: "FLY",
   tokenAddress: "0xceE732A0278df525F474a121902F8f4e7F372c52",
 }, 
 {
   symbol: "ARK",
   tokenAddress: "0x9D1Da8c1eAA9804C00Bb5828b2911985270818ed",
 }, 
{
  symbol: "First",
  tokenAddress: "0x2CC195ED7dC6a462EdcF29c397996ECe1814bc59",
}, 
{
  symbol: "NUT",
  tokenAddress: "0x1b032b16f2607E84c3964a36f1332b4Ca6786507",
}, 
{
  symbol: "NI",
  tokenAddress: "0xBb4D10d563E271FD717712176e75cD8226116d63",
}, 
];

const getAccount = async () => {
  await provider.send("eth_requestAccounts", []); // Login to metamask
  const account = provider.getSigner();
  return account;
};

// Get decimal of ERC20 tokens
const getDecimals = async (tokenAddr) => {

  const account = await getAccount();
  
  const token = new ethers.Contract(
    tokenAddr,
    ["function decimals() view returns(uint8)"],
    account
  );
  
  return await token.decimals();    
};

// Get allowance of ERC20 tokens
const getAllowance = async (tokenAddr, spenderAddr) => {

  const account = await getAccount();
  
  const token = new ethers.Contract(
    tokenAddr,
    ["function allowance(address, address) view returns(uint256)"],
    account
  );
  
  const ownerAddr = await account.getAddress();
  console.log ("getAllowance", ownerAddr, spenderAddr);

  return await token.allowance(ownerAddr, spenderAddr);    
};


// Get Approval for Spending ERC20 token
const getApproval = async (tokenAddr, spenderAddr, amount) => {
  const account = await getAccount();
  
  console.log ("getApproval");
  console.log ("token addr", tokenAddr);
  console.log ("spender addr", spenderAddr);
  console.log ("amount", amount.toString());

  // check available allowance
  const allowance = await getAllowance(tokenAddr, spenderAddr);

  console.log ("getApproval: getAllowance", allowance);

  // seek approval if allowance is not sufficient
  if (allowance < amount){
    console.log ("getApproval: not sufficient allowance");

    const token = new ethers.Contract(
      tokenAddr,
      ["function approve(address, uint256) returns(bool)"],
      account
    );
  
    const response = await token.approve(spenderAddr, amount); 

    const receipt = await response.wait();

    console.log(receipt);
  }
  else{
    console.log("getApproval: sufficient allowance");
  }
}

// Get balance of ERC20 tokens
const balanceOf = async (tokenAddr) => {

  const account = await getAccount();
  
  const token = new ethers.Contract(
    tokenAddr,
    ["function balanceOf(address) view returns(uint256)"],
    account
  );
  
  const balance = await token.balanceOf(await account.getAddress());

  return ethers.utils.formatUnits(balance, 0);                 
};

const getReserves = async (tokenAAddr, tokenBAddr) => {
  const account = await getAccount();

  // get the Uniswap Factory
  const uniswapFactory = new ethers.Contract(
    UNISWAPFACTORY_ADDRESS,
    ["function getPair (address, address) view returns(address)"],
    account
  );

  // get the liquidity pool contract address
  const poolAddress = await uniswapFactory.getPair(tokenAAddr, tokenBAddr);
  
  // get the Uniswap pool contract 
  const pool = new ethers.Contract(
    poolAddress,
    ["function getReserves() view returns (uint112, uint112, uint32)",
    "function token0 () view returns (address)",
    ],
    account
  );

  // get the reserves
  const reserves = await pool.getReserves();
  
  // get token0 address
  const token0 = await pool.token0();

  // check if tokenAAddr is the same as token0, and arrange
  // the return values accordingly
  return tokenAAddr === token0
    ? { reserveA: reserves[0], reserveB: reserves[1] }
    : { reserveA: reserves[1], reserveB: reserves[0] };
};

// estimate the amount in 
const getAmountIn = (amountOut, reserveIn, reserveOut) => {
  amountOut = BigNumber.from(amountOut);
        
  const numerator = amountOut.mul(reserveIn);
  const denominator = reserveOut.sub(amountOut);
  let amountInWithFee = numerator.mul(1000) / denominator.mul(997);
        
  return BigNumber.from(Math.ceil(amountInWithFee).toString());
};

// estimate the amount out
const getAmountOut = (amountIn, reserveIn, reserveOut) => {
  amountIn = BigNumber.from(amountIn);
  
  const amountInWithFee = amountIn.mul(997);
  const numerator = amountInWithFee.mul(reserveOut);
  const denominator = reserveIn.mul(1000).add(amountInWithFee);
  let amountOut = numerator / denominator;
  
  return BigNumber.from(Math.floor(amountOut).toString());
};

const distill = async (time) => {
  const account = await getAccount();
  const distillery = new ethers.Contract(
    DISTILLERY_ADDRESS,
    ["function distill(uint256)"],
    account
  );
  const response = await distillery.distill(time - 1);
  const receipt = await response.wait();
  console.log(receipt);
};

const getTimeBalance = async () => {
  const account = await getAccount();
  const chronium = new ethers.Contract(
    CHRONIUM_ADDRESS,
    ["function checkTimeBalance(address) view returns(uint256)"],
    account
  );
  return await chronium.checkTimeBalance(await account.getAddress());
};
  
// Sell exact amount of input tokens for output tokens using UniswapV2
const sellTokens = async (inputAmt, inputAddr, outputAddr) => {
  console.log("sellTokens");

  let isInputValid = false;

  // input validation
  inputAmt = +inputAmt;

  if (  ethers.utils.isAddress(outputAddr)
      &&ethers.utils.isAddress(inputAddr)
      &&Number.isInteger(inputAmt))
  {
    isInputValid = true;
  };
  
  if (isInputValid === true)
  {
    const account = await getAccount();

    // create the uniswap router object
    const uniswap = new ethers.Contract(
      UNISWAPROUTER_ADDRESS,
      ["function swapExactTokensForTokens(uint, uint, address[], address, uint)  returns(uint[] memory)"],
      account
    );
    
    let reserves;
    try {
      reserves = await getReserves(inputAddr, outputAddr);
    }
    catch(e){
      console.log ("Sell Tokens: Failed to get pool reserves");
      throw new Error ('Sell Tokens: Failed to get pool reserves');
    };
    
    console.log ("input token", inputAddr);
    console.log ("input token reserve", reserves.reserveA.toString());
    console.log ("output token", outputAddr);
    console.log ("output token reserve", reserves.reserveB.toString());

    // estimate the min amt out
    const amtOut = getAmountOut(inputAmt, reserves.reserveA, reserves.reserveB);
    console.log ("amt out", amtOut.toString());

    const minAmtOut = Math.floor(0.9 * amtOut);
    console.log ("min amt out", minAmtOut);

    // seek approval to allow UNISWAPROUTER_ADDRESS to withdraw inputAmt
    try {
      await getApproval(inputAddr, UNISWAPROUTER_ADDRESS, inputAmt);
    }
    catch(e){
      console.log(e);
      throw new Error ('Sell Tokens: Failed to get approval');
    };   
    
    const ts = (await provider.getBlock()).timestamp + 1000;

    console.log("prepare for swapExactTokensForTokens");

    try{
      const response = await uniswap
                            .swapExactTokensForTokens(
                            inputAmt,
                            minAmtOut,
                            [inputAddr, outputAddr],
                            account.getAddress(),
                            ts
                      );
                      
      const receipt = await response.wait();
      console.log(receipt);
    }
    catch(e){
         console.log ("Sell Tokens: Failed to swap");
        throw new Error ('Sell Tokens: Failed to swap');
    };    
  }
  else
  {
    console.log ("Sell Tokens: Invalid input");
    throw new Error ('Sell Tokens: Invalid input');
  };
};

// Buy exact amount of output tokens for input tokens using UniswapV2
const buyTokens = async (outputAmt, outputAddr, inputAddr) => {
  console.log("buyTokens");

  let isInputValid = false;
  
  // input validation
  outputAmt = +outputAmt;

  if (  ethers.utils.isAddress(outputAddr)
      &&ethers.utils.isAddress(inputAddr)
      &&Number.isInteger(outputAmt))
  {
    isInputValid = true;
  };
  
  if (isInputValid === true)
  {
    const account = await getAccount();

    // create the uniswap router object
    const uniswap = new ethers.Contract(
      UNISWAPROUTER_ADDRESS,
      ["function swapTokensForExactTokens(uint, uint, address[], address, uint)  returns(uint[] memory)"],
      account
    );
    
    let reserves;

    try {
      reserves = await getReserves(inputAddr, outputAddr);
    }
    catch(e){
      console.log ("Buy Tokens: Failed to get pool reserves");
      throw new Error ('Buy Tokens: Failed to get pool reserves');    
    };
    
    console.log ("input token", inputAddr);
    console.log ("input token reserve", reserves.reserveA.toString());
    console.log ("output token", outputAddr);
    console.log ("output token reserve", reserves.reserveB.toString());

    // estimate max amt in
    const amtIn = getAmountIn(outputAmt, reserves.reserveA, reserves.reserveB);
    console.log ("amt in", amtIn.toString());

    const maxAmtIn = Math.ceil(1.1 * amtIn);
    console.log ("max amt in", maxAmtIn);
      
    // seek approval to allow UNISWAPROUTER_ADDRESS to withdraw up to maxAmt in
    try {
      await getApproval(inputAddr, UNISWAPROUTER_ADDRESS, maxAmtIn);   
    }
    catch(e){
      console.log(e);
      throw new Error ('Buy Tokens: Failed to get approval');
    };

    const ts = (await provider.getBlock()).timestamp + 1000;

    console.log("prepare for swapTokensForExactTokens");

    try{
      const response = await uniswap
                            .swapTokensForExactTokens(
                            outputAmt,
                            maxAmtIn,
                            [inputAddr, outputAddr],
                            account.getAddress(),
                            ts
                        );
      const receipt = await response.wait();
      console.log(receipt);
    }
    catch(e){
      console.log ("Buy Tokens: Failed to swap");
      throw new Error ('Buy Tokens: Failed to swap');
    };
  }
  else
  {
    console.log("Buy Tokens: Invalid input");
    throw new Error ('Buy Tokens: Invalid input');
  };
};

export {
  tokens,
  distill,
  getTimeBalance,
  getAccount,
  sellTokens,
  buyTokens,
  balanceOf,
  CHRONIUM_ADDRESS,
};
