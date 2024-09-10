import { RouteMap } from "../types";

export const Protocols={
    UNISWAP_V3:0, 
    UNISWAP_V2:1, 
    SUSHISWAP: 2, 
    QUICKSWAP:3, 
    JETSWAP:4, 
    POLYCAT:5, 
    APESWAP: 6, 
    WAULTSWAP:7, 
    DODO: 9
};

export const Routers :RouteMap ={
    POLYGON_UNISWAP_V3:"0xE592427A0AEce92De3Edee1F18E0157C05861564", //Uniswap V3 router on polygon network
    POLYGON_UNISWAP_V2:"0xedf6066a2b290C185783862C7F4776A2C8077AD1", //Uniswap V2 router on Polygon network
    POLYGON_SUSHISWAP:"0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",//Sushiswap v2 router on polygon 
    POLYGON_QUICKSWAP:"0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",  //QuickSwap v2 router on polygon
    POLYGON_JETSWAP:"0x5C6EC38fb0e2609672BDf628B1fD605A523E5923", 
    POLYGON_POLYCAT:"0x94930a328162957FF1dd48900aF67B5439336cBD", 
    POLYGON_APESWAP: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607", 
    POLYGON_WAULTSWAP:"0x3a1D87f206D12415f5b0A33E786967680AAb4f6d", 
}

export const dodoV2Pool={
    WETH_USDC:"0x75c23271661d9d143DCb617222BC4BEc783eff34", //DODO's WETH-USDC pair on etherscan
    WETH_ULT:"0xd028e331c9a29a1B5dE87279Bf79de5ff04Fe98b", // DODO's WETH-ULT Contract on Polygon
}

export const factories = {
    POLYGON_SUSHISWAP: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    POLYGON_QUICKSWAP:"0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    POLYGON_APESWAP:"0xCf083Be4164828f00cAE704EC15a36D711491284",
    POLYGON_UNISWAP_V2:"0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C"
}

export const QUOTER_ADDRESS="0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"; //Uniswap Quoter V3 on Ethereum
export const QUOTER_ADDRESS2="0x61fFE014bA17989E743c5F6cB21bF9697530B21e";// Uniswap Quoter V2 on Ethereum