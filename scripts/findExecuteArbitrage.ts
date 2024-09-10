import {Protocols, Routers, dodoV2Pool, factories} from "../constants";
import {ERC20Token} from "../constants/tokens";
import { getPriceInUSDC } from "../utils/getPriceInUSDC";
import {ethers} from "hardhat";
import flashloan from "../artifacts/contracts/FlashLoan.sol/Flashloan.json";
import { FlashLoanParams } from "../types";
import { findRouterByProtocol } from "../utils/findRouterByProtocol";
import { executeFlashloan } from "./executeFlashloan";
require("dotenv").config();

const MIN_PRICE_DIFF=5000000;// this equals $5, because USDC has 6 decimals we've put 6 zeros 
const provider=new ethers.JsonRpcProvider("http://localhost:8545")
//const providerUrl="https://polygon-mainnet.infura.io/v3/6000068b86d54cc99d7adca1015120c5";

const checkArbitrageWethUsdc= async()=>{

        const sushiQuote=await getPriceInUSDC({
            router: Routers.POLYGON_SUSHISWAP,
            factory: factories.POLYGON_SUSHISWAP,
            tokenAddress: ERC20Token.WETH?.address,
            id:Protocols.SUSHISWAP,
            provider
        });
        const quickQuote=await getPriceInUSDC({
            router: Routers.POLYGON_QUICKSWAP,
            factory: factories.POLYGON_QUICKSWAP,
            tokenAddress: ERC20Token.WETH?.address,
            id:Protocols.QUICKSWAP,
            provider
        });
        const apeQuote=await getPriceInUSDC({
            router: Routers.POLYGON_APESWAP,
            factory: factories.POLYGON_APESWAP,
            tokenAddress: ERC20Token.WETH?.address,
            id:Protocols.APESWAP,
            provider
        });
        const quotes=[sushiQuote,quickQuote,apeQuote];
        const min=quotes.reduce((min, obj)=>(obj.quote<min.quote?obj:min));
        const max=quotes.reduce((max, obj)=>(obj.quote>max.quote?obj:max));
        const biggestPriceDiff=max.quote-min.quote;
        console.log("Biggest price difference $", ethers.formatUnits(biggestPriceDiff, 6));
        console.log(`Total liquidity in SushiSwap pool is $${ethers.formatUnits(sushiQuote.reserves[0],6)}`);
        console.log(`Total liquidity in QuickSwap pool is $${ethers.formatUnits(quickQuote.reserves[0],6)}`);
        console.log(`Total liquidity in ApeSwap pool is $${ethers.formatUnits(apeQuote.reserves[0],6)}`);
        return {min, max, biggestPriceDiff}
}

const executeArgitrage= async()=>{
        try{
            const {min, max, biggestPriceDiff}=await checkArbitrageWethUsdc();
            if(biggestPriceDiff>=MIN_PRICE_DIFF){
                console.log("start of  if block");
                const wallet = new ethers.Wallet(process.env.PRIVATEKEY!,provider);
                const Flashloan=new ethers.Contract(process.env.FLASHLOAN_ADDRESS!,flashloan.abi, provider);
                const params: FlashLoanParams={
                    flashLoanContractAddress:Flashloan.target.toString(), 
                    flashLoanPool: dodoV2Pool.WETH_ULT, 
                    loanAmount: ethers.parseEther(".000003"),// we borrowed 3000,000,000,000 wei 
                    loanAmountDecimals: 18, 
                    hops:[
                        {
                            protocol: max.protocol, 
                            data: ethers.AbiCoder.defaultAbiCoder().encode(
                                ["address"], 
                                [findRouterByProtocol(max.protocol)]
                            ), 
                            path: [ERC20Token.WETH?.address, ERC20Token.USDC?.address]
                        }, 
                        {
                            protocol: min.protocol, 
                            data: ethers.AbiCoder.defaultAbiCoder().encode(
                                ["address"], 
                                [findRouterByProtocol(min.protocol)]
                            ), 
                            path: [ERC20Token.USDC?.address, ERC20Token.WETH?.address]                
                        }
                    ], 
                    gasLimit:3_000_000, 
                    gasPrice:ethers.parseUnits("300","gwei"), 
                    signer: wallet
                } 
                const tx=await executeFlashloan(params);
            }
        }catch(error){
            console.log(error);
        }
}

executeArgitrage().catch((error)=>{
    console.error(error);
    process.exitCode=1;
})

