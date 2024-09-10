import {ethers, network} from "hardhat";
import { FundingParams } from "../types";

export const fundErc20 = async (fundingParams: FundingParams)=>{

    const {sender, tokenContract, amount, decimals, recipient}=fundingParams;
    const FUND_AMOUNT = ethers.parseUnits(amount, decimals);
    const mrWhale=await ethers.getSigner(sender);
    const contractSigner=tokenContract.connect(mrWhale)
    await contractSigner.transfer(
        recipient, 
        FUND_AMOUNT,
        // { 
        //     gasLimit:3_000_000, 
        //     gasPrice:ethers.parseUnits("300","gwei"), 
        // }
    );
}

const anotherImpersonateFundErc20 = async (fundingParams: FundingParams) => {
    const {sender, tokenContract, amount, decimals, recipient}=fundingParams;
    const FUND_AMOUNT = ethers.parseUnits(amount, decimals);
    const mrWhale = await ethers.getSigner(sender);
    await tokenContract.connect(mrWhale).transfer(recipient, FUND_AMOUNT);
};

export const impersonateFundERC20 = async (fundingParams: FundingParams)=>{

    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [fundingParams.sender],
      });

    await fundErc20(fundingParams);

    await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [fundingParams.sender],
    });
}