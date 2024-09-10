import { Flashloan, Flashloan__factory } from "../typechain-types";
import { deployContract } from "../utils/deployContract";
import {DeployDODOFlashloanParams} from "../types";
import { ethers } from "ethers";

export async function deployDodoFlashloan(params:DeployDODOFlashloanParams){
    
    const Flashloan:Flashloan=await deployContract(
        Flashloan__factory,
        [], 
        params.wallet
    );
    const deployed = await Flashloan.waitForDeployment();
    return deployed; 

}

const deploy=async ()=>{
    const provider=new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // const privateKey=process.env.PRIVATE_KEY;
    // const wallet = new ethers.Wallet(privateKey!, provider);
    const wallet = await provider.getSigner(0);
    const Flashloan=await deployDodoFlashloan({
        wallet 
    });
    return Flashloan;
}

deploy().then((flashloan)=>{
    console.log("contract deployed to: ",flashloan.target);
})

