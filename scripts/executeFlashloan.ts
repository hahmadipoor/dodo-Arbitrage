import {ethers} from "ethers";
import flashLoanJson from "../artifacts/contracts/FlashLoan.sol/Flashloan.json";
import {FlashLoanParams} from "../types"
require("dotenv").config();

export async function executeFlashloan(params: FlashLoanParams){
    console.log("start of execute flash loan")
    const Flashloan: any = new ethers.Contract(params.flashLoanContractAddress, flashLoanJson.abi, params.signer);
    const tx=await Flashloan.executeFlashloan(
        {
            flashLoanPool: params.flashLoanPool, 
            loanAmount: params.loanAmount, 
            routes: [
                {
                    hops: params.hops,
                    part: 10000
                }
            ]
        }, 
        {
            gasLimit: params.gasLimit, 
            gasPrice: params.gasPrice
        }
    );

    return tx;
}