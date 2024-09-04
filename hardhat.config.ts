import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity:{
    compilers:[
      {
        version:"0.8.4"
      },
      {
        version:"0.6.12"
      },
      {
        version:"0.8.19"
      },
      {
        version:"0.8.20"
      }, 
      {
        version:"0.8.24"
      },
    ]
  }, 
  networks:{
    localhost:{
      url: "http://localhost:8545"
    }, 
    polygon:{
      url:"https://polygon-mainnet.infura.io/v3/6000068b86d54cc99d7adca1015120c5"
    }
  }
};

export default config;

