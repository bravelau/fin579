import { ethers, BigNumber } from "ethers";
const CHRONIUM_ADDRESS = "0xDd6010412b61570bd6f0101460bb80bDbE103E28";
const DISTILLERY_ADDRESS = "0xa20f2c420f14418b580f60A4964727B66f34C88d";
const UNISWAPROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAPFACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const provider = new ethers.providers.Web3Provider(window.ethereum);

//tmp addr
const SPENDER_ADDRESS = "0xD484f9dE8609d32573b244D964D7a6Dc6EA3586F";

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

// Get Approval for Spending ERC20 token
const getApproval = async (tokenAddr, spenderAddr, amount) => {
  const account = await getAccount();
  
  console.log ("getApproval");
  console.log ("token addr", tokenAddr);
  console.log ("spender addr", spenderAddr);
  console.log ("amount", amount.toString());

  const token = new ethers.Contract(
    tokenAddr,
    ["function approve(address, uint256) returns(bool)"],
    account
  );
  
  const app = await token.approve(spenderAddr, amount); 

  return app;   
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

  return ethers.utils.formatUnits(balance, await getDecimals(tokenAddr));                 
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

  const account = await getAccount();

  // create the uniswap router object
  const uniswap = new ethers.Contract(
    UNISWAPROUTER_ADDRESS,
    ["function swapExactTokensForTokens(uint, uint, address[], address, uint)  returns(uint[] memory)"],
    account
  );
  
  const reserves = await getReserves(inputAddr, outputAddr);
  
  console.log ("input token", inputAddr);
  console.log ("input token reserve", reserves.reserveA.toString());
  console.log ("output token", outputAddr);
  console.log ("output token reserve", reserves.reserveB.toString());

  // estimate the min amt out
  const amtOut = getAmountOut(inputAmt, reserves.reserveA, reserves.reserveB);
  console.log ("amt out", amtOut.toString());

  const minAmtOut = Math.floor(0.95 * amtOut);
  console.log ("min amt out", minAmtOut);

  // seek approval to allow UNISWAPROUTER_ADDRESS to withdraw inputAmt
  const receipt = await getApproval(inputAddr, UNISWAPROUTER_ADDRESS, inputAmt);

  const response = receipt.wait();

  const ts = (await provider.getBlock()).timestamp + 1000;

  console.log("prepare for swapExactTokensForTokens");
  await uniswap
        .swapExactTokensForTokens(
               inputAmt,
               minAmtOut,
               [inputAddr, outputAddr],
               account.getAddress(),
               ts
           );
};

// Buy exact amount of output tokens for input tokens using UniswapV2
const buyTokens = async (outputAmt, outputAddr, inputAddr) => {
  console.log("buyTokens");

  const account = await getAccount();

  // create the uniswap router object
  const uniswap = new ethers.Contract(
    UNISWAPROUTER_ADDRESS,
    ["function swapTokensForExactTokens(uint, uint, address[], address, uint)  returns(uint[] memory)"],
    account
  );

  const reserves = await getReserves(inputAddr, outputAddr);
  
  console.log ("input token", inputAddr);
  console.log ("input token reserve", reserves.reserveA.toString());
  console.log ("output token", outputAddr);
  console.log ("output token reserve", reserves.reserveB.toString());

  // estimate max amt in
  const amtIn = getAmountIn(outputAmt, reserves.reserveA, reserves.reserveB);
  console.log ("amt in", amtIn.toString());

  const maxAmtIn = Math.ceil(1.05 * amtIn);
  console.log ("max amt in", maxAmtIn);
    
  // seek approval to allow UNISWAPROUTER_ADDRESS to withdraw up to maxAmt in
  const approve = await getApproval(inputAddr, UNISWAPROUTER_ADDRESS, maxAmtIn);
  console.log ("approve", approve);
 
  const ts = (await provider.getBlock()).timestamp + 1000;

  console.log("prepare for swapTokensForExactTokens");

  await uniswap
        .swapTokensForExactTokens(
          outputAmt,
          maxAmtIn,
          [inputAddr, outputAddr],
          account.getAddress(),
          ts
        );
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
