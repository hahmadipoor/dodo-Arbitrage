
import {ethers} from "ethers";
import { deployDodoFlashloan } from "../scripts/deployDodoFlashloan";
import { FlashLoanParams } from "../types";
import { dodoV2Pool } from "../constants";
import { findRouterByProtocol } from "../utils/findRouterByProtocol";
import { ERC20Token } from "../constants/tokens";
import { Protocols } from "../constants";
import { executeFlashloan } from "../scripts/executeFlashloan";
import flashLoanJson from "../artifacts/contracts/FlashLoan.sol/Flashloan.json";
import WethABI from "../abis/polygonWethAbi.json";
import { ERC20__factory } from "../typechain-types";
import { impersonateAccount } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { impersonateFundERC20 } from "../utils/funding";

require("dotenv").config();

describe("DODO Flashloan", ()=>{

    it("Execute flashloan", async ()=>{

        const provider=new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        // const privateKey=process.env.PRIVATE_KEY;
        // const wallet = new ethers.Wallet(privateKey!, provider);
        const wallet = await provider.getSigner(0);

        const Flashloan=await deployDodoFlashloan({
            wallet 
        });

        //const tokenContract = ERC20__factory.connect(ERC20Token.WETH?.address, provider)
        // const mrWhale="0x8832924854e3Cedb0a6Abf372e6CCFF9F7654332";
        // await impersonateFundERC20({
        //     sender:mrWhale, 
        //     tokenContract, 
        //     recipient: await Flashloan.getAddress(),
        //     decimals: 18, 
        //     amount: "1"
        // });
        const params: FlashLoanParams={
            flashLoanContractAddress:Flashloan.target.toString(), 
            flashLoanPool: dodoV2Pool.WETH_ULT, 
            loanAmount: ethers.parseEther(".000001"), 
            loanAmountDecimals: 18, 
            hops:[
                {
                    protocol: Protocols.UNISWAP_V2, 
                    data: ethers.AbiCoder.defaultAbiCoder().encode(
                        ["address"], 
                        [findRouterByProtocol(Protocols.UNISWAP_V2)]
                    ), 
                    path: [ERC20Token.WETH?.address, ERC20Token.USDC?.address]
                }, 
                {
                    protocol: Protocols.SUSHISWAP, 
                    data: ethers.AbiCoder.defaultAbiCoder().encode(
                        ["address"], 
                        [findRouterByProtocol(Protocols.SUSHISWAP)]
                    ), 
                    path: [ERC20Token.USDC?.address, ERC20Token.WETH?.address]                
                }
            ], 
            gasLimit:3_000_000, 
            gasPrice:ethers.parseUnits("300","gwei"), 
            signer: wallet
        } 

        const tx=await executeFlashloan(params);
        console.log("Tx hash", tx.hash); 
    })
})