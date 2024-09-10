import {ethers} from "hardhat";
import {PriceInUsdcParams} from "../types";
import uniV2RouterAbi from "../abis/uniV2RouterAbi.json";
import uniV2FactoryAbi from "../abis/uniV2FactoryAbi.json";
import uniV2PairAbi from "../abis/uniV2Pair.json";
import { ERC20Token } from "../constants/tokens";
import { Protocols } from "../constants";
import { Routers } from "../constants";

export const getPriceInUSDC= async (params:PriceInUsdcParams)=>{
    const factory= new ethers.Contract(params.factory, uniV2FactoryAbi, params.provider);
    const router = new ethers.Contract(params.router, uniV2RouterAbi, params.provider);
    const pairAddress=await factory.getPair(params.tokenAddress, ERC20Token.USDC?.address);
    const pair=new ethers.Contract(pairAddress, uniV2PairAbi, params.provider);
    const reserves=await pair.getReserves();
    const quote=await router.quote( ethers.parseEther("1"), reserves[1], reserves[0]);
    console.log(`Price of ${params.tokenAddress} = $${ethers.formatUnits(quote,6)} for protocol id ${params.id}`);
    return {
        quote, 
        protocol:params.id,
        reserves
    }
}

// getPriceInUSDC({
//     router:Routers.POLYGON_SUSHISWAP,
//     factory: Routers.POLYGON_SUSHISWAP,
//     tokenAddress:ERC20Token.WETH?.address,
//     id:Protocols.UNISWAP_V2
// })