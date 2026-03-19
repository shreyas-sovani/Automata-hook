import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  paths: {
    sources: "./src/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    unichainSepoliaOrigin: {
      url: process.env.UNICHAIN_SEPOLIA_RPC_URL || "https://unichain-sepolia.g.alchemy.com/v2/demo",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64 ? [process.env.PRIVATE_KEY] : process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66 ? [process.env.PRIVATE_KEY] : [],
    },
    kopli: {
      url: process.env.KOPLI_RPC_URL || "https://lasna-rpc.rnk.dev/",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64 ? [process.env.PRIVATE_KEY] : process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66 ? [process.env.PRIVATE_KEY] : [],
    },
    unichainSepoliaTarget: {
      url: process.env.UNICHAIN_SEPOLIA_RPC_URL || "https://unichain-sepolia.g.alchemy.com/v2/demo",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 64 ? [process.env.PRIVATE_KEY] : process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66 ? [process.env.PRIVATE_KEY] : [],
    }
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify.rnk.dev/",
    browserUrl: "https://lasna.reactscan.net"
  }
};

export default config;
