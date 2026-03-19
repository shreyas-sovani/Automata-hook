// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers.length > 0 ? signers[0] : new ethers.Wallet(process.env.PRIVATE_KEY!, ethers.provider);
  console.log("Deploying contracts with the account:", deployer.address);

  // We need to differentiate network deployments
  const network = process.env.HARDHAT_NETWORK || "unichainSepolia";
  
  if (network === "unichainSepoliaOrigin") {
    console.log("Deploying SwapEmitter to Unichain Sepolia...");
    const SwapEmitter = await ethers.getContractFactory("SwapEmitter");
    const emitter = await SwapEmitter.deploy();
    await emitter.waitForDeployment();
    console.log("SwapEmitter deployed to:", await emitter.getAddress());
  } 
  else if (network === "kopli") {
    console.log("Deploying AutomataBrain to ReactVM (Kopli)...");
    
    // Addresses specified in the PRD or docs
    const RVM_SERVICE_ADDRESS = process.env.RVM_SERVICE_ADDRESS || "0x0000000000000000000000000000000000fffFfF"; // Reactive Subscription contract on Lasna
    const SWAP_EMITTER_ADDRESS = process.env.SWAP_EMITTER_ADDRESS;
    const TARGET_HOOK_ADDRESS = process.env.TARGET_HOOK_ADDRESS;
    if (!SWAP_EMITTER_ADDRESS || !TARGET_HOOK_ADDRESS) {
      throw new Error("Missing SWAP_EMITTER_ADDRESS or TARGET_HOOK_ADDRESS in .env for kopli deployment");
    }

    const AutomataBrain = await ethers.getContractFactory("AutomataBrain");
    const brain = await AutomataBrain.deploy(RVM_SERVICE_ADDRESS, SWAP_EMITTER_ADDRESS, TARGET_HOOK_ADDRESS);
    await brain.waitForDeployment();
    console.log("AutomataBrain deployed to:", await brain.getAddress());
  }
  else if (network === "unichainSepoliaTarget") {
    console.log("Deploying AutomataHook to Unichain Sepolia...");
    
    // Config args
    const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4"; // Standard Reactive Unichain Proxy
  const RVM_EXPECTED_ADDRESS = process.env.RVM_EXPECTED_ADDRESS || "0x0000000000000000000000000000000000fffFfF";
    
    // Dummy pool manager and pool key setup
    const DUMMY_POOL_MANAGER = "0x0000000000000000000000000000000000000000";
    const DUMMY_POOL_KEY = {
         currency0: "0x0000000000000000000000000000000000000000",
         currency1: "0x0000000000000000000000000000000000000000",
         fee: 3000,
         tickSpacing: 60,
         hooks: "0x0000000000000000000000000000000000000000"
    };

    const AutomataHook = await ethers.getContractFactory("AutomataHook");
    const hook = await AutomataHook.deploy(PROXY_ADDRESS, RVM_EXPECTED_ADDRESS, DUMMY_POOL_MANAGER, DUMMY_POOL_KEY);
    await hook.waitForDeployment();
    console.log("AutomataHook deployed to:", await hook.getAddress());
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
