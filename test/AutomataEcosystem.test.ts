import { expect } from "chai";
import { ethers, network } from "hardhat";
import { 
  SwapEmitter, 
  AutomataHook, 
  AutomataBrain, 
  DummyPoolManager, 
  DummySubscriptionService 
} from "../typechain-types";
import { time, mine } from "@nomicfoundation/hardhat-network-helpers";

describe("Automata Ecosystem Coverage", function () {
  let emitter: SwapEmitter;
  let hook: AutomataHook;
  let brain: AutomataBrain;
  let brainRealVM: AutomataBrain; // Deployed when mock VM is present
  let poolManager: DummyPoolManager;
  let subService: DummySubscriptionService;

  let deployer: any, proxy: any, rvm: any, randomUser: any;
  let RVM_ADDRESS_MOCK = "0x0000000000000000000000000000000000fffFfF";
  let livePoolKey: any;

  const POOL_KEY = {
    currency0: ethers.ZeroAddress,
    currency1: ethers.ZeroAddress,
    fee: 3000,
    tickSpacing: 60,
    hooks: ethers.ZeroAddress
  };

  before(async function () {
    [deployer, proxy, rvm, randomUser] = await ethers.getSigners();

    // 1. Deploy SwapEmitter
    const SwapEmitterFactory = await ethers.getContractFactory("SwapEmitter");
    emitter = (await SwapEmitterFactory.deploy()) as unknown as SwapEmitter;

    // 2. Deploy Dummy Services
    const DummyPMFactory = await ethers.getContractFactory("DummyPoolManager");
    poolManager = (await DummyPMFactory.deploy()) as unknown as DummyPoolManager;

    const DummySubFactory = await ethers.getContractFactory("DummySubscriptionService");
    subService = (await DummySubFactory.deploy()) as unknown as DummySubscriptionService;

    // 3. Deploy AutomataHook
    const HookFactory = await ethers.getContractFactory("AutomataHook");
    hook = (await HookFactory.deploy(
      proxy.address,
      rvm.address,
      await poolManager.getAddress(),
      POOL_KEY
    )) as unknown as AutomataHook;

    livePoolKey = {
      ...POOL_KEY,
      hooks: await hook.getAddress(),
    };

    // 4. Deploy AutomataBrain (Local Environment extcodesize(rvm) == 0 -> vm=true)
    const BrainFactory = await ethers.getContractFactory("AutomataBrain");
    brain = (await BrainFactory.deploy(
      await subService.getAddress(), 
      await emitter.getAddress(), 
      await hook.getAddress()
    )) as unknown as AutomataBrain;
  });

  describe("1. SwapEmitter", function() {
    it("Should emit WhaleDump on emitDump()", async function() {
      const originPool = ethers.Wallet.createRandom().address;
      const notionalVol = 50000;

      await expect(emitter.emitDump(originPool, notionalVol))
        .to.emit(emitter, "WhaleDump")
        .withArgs(originPool, notionalVol);
    });
  });

  describe("2. AutomataBrain (Reactive Core)", function() {
    it("Should emit Callback correctly when react() is called in a pure local context (vm=true)", async function() {
      const originPool = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
      const topic1 = ethers.zeroPadValue(originPool, 32); 
      
      const logRecord = {
        chain_id: 1301,
        _contract: await emitter.getAddress(),
        topic_0: ethers.id("WhaleDump(address,uint256)"),
        topic_1: topic1,
        topic_2: ethers.ZeroHash,
        topic_3: ethers.ZeroHash,
        data: ethers.solidityPacked(["uint256"], [100000]),
        block_number: 100,
        op_code: 0,
        block_hash: ethers.ZeroHash,
        tx_hash: ethers.ZeroHash,
        log_index: 0
      };

      await expect(brain.react(logRecord))
        .to.emit(brain, "Callback");
    });

    it("Testing constructor subscription by simulating vm=false presence via hardhat_setCode", async function() {
      // Mock extcodesize > 0 for standard reactive VM address
      await network.provider.send("hardhat_setCode", [
        RVM_ADDRESS_MOCK,
        "0x1234"
      ]);

      const BrainFactory = await ethers.getContractFactory("AutomataBrain");
      brainRealVM = (await BrainFactory.deploy(
        await subService.getAddress(), 
        await emitter.getAddress(), 
        await hook.getAddress()
      )) as unknown as AutomataBrain;

      // Verify that subscription service was called
      expect(await subService.subscribed()).to.be.true;

      // Attempting to call react() should fail because vm=false inside brainRealVM
      const logRecord = {
        chain_id: 1, _contract: ethers.ZeroAddress, topic_0: 0, topic_1: 0, topic_2: 0, topic_3: 0,
        data: "0x", block_number: 1, op_code: 0, block_hash: 0, tx_hash: 0, log_index: 1
      };

      await expect(brainRealVM.react(logRecord)).to.be.revertedWith("Only ReactVM can call this");

      // Reset RVM_ADDRESS_MOCK code
      await network.provider.send("hardhat_setCode", [
        RVM_ADDRESS_MOCK,
        "0x"
      ]);
    });
  });

  describe("3. AutomataHook", function() {
    const originChainId = 1301;
    const originPool = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    
    it("Should revert transitionState if not called by Proxy", async function() {
      await expect(
        hook.connect(randomUser).transitionState(rvm.address, originChainId, originPool, 1, 1)
      ).to.be.revertedWith("Only Reactive Proxy");
    });

    it("Should revert transitionState if RVM ID is mismatched", async function() {
      await expect(
        hook.connect(proxy).transitionState(randomUser.address, originChainId, originPool, 1, 1)
      ).to.be.revertedWith("Invalid RVM Origin");
    });

    it("Should successfully transition state on happy path", async function() {
      await expect(
        hook.connect(proxy).transitionState(rvm.address, originChainId, originPool, 10, 1)
      ).to.emit(hook, "StateTransition")
      .withArgs(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "address"], [originChainId, originPool])), 1, 10);
      
      expect(await hook.currentState()).to.equal(1);
    });

    it("Should revert on stale payload (replay protection)", async function() {
      await expect(
        hook.connect(proxy).transitionState(rvm.address, originChainId, originPool, 5, 1)
      ).to.be.revertedWith("Stale Payload");
    });

    it("Should revert if minimum dwell blocks not met (Hysteresis)", async function() {
      await expect(
        hook.connect(proxy).transitionState(rvm.address, originChainId, originPool, 15, 0)
      ).to.be.revertedWith("Hysteresis: Min dwell not met");
    });

    it("Should execute after Hysteresis is cleared", async function() {
      // Mine 10 blocks to clear hysteresis
      await mine(10);
      
      await expect(
        hook.connect(proxy).transitionState(rvm.address, originChainId, originPool, 20, 0)
      ).to.emit(hook, "StateTransition");

      expect(await hook.currentState()).to.equal(0);
    });

    it("applyDecay should not decay if condition is purely safely within timeframe", async function() {
      await mine(15);
      await hook.connect(proxy).transitionState(rvm.address, originChainId, originPool, 25, 1);
      expect(await hook.currentState()).to.equal(1);

      await hook.applyDecay();
      expect(await hook.currentState()).to.equal(1); // Should still be 1 (no decay)
    });

    it("applyDecay should reduce state when Time Decay passes", async function() {
      // Fast forward > 1 hour
      await time.increase(3601);
      
      await expect(hook.applyDecay()).to.emit(hook, "StateTransitionDecayed");
      expect(await hook.currentState()).to.equal(0);
    });

    it("beforeSwap should properly calculate and update correct LP Fee during neutral state (0)", async function() {
      const dummyParams = { zeroForOne: true, amountSpecified: 0, sqrtPriceLimitX96: 0 };
      
      // We expect the fee calculated to be stateFees[0] = 3000
  await poolManager.swap(livePoolKey, dummyParams, "0x");
      const lpFee = await poolManager.lastFee();
      expect(lpFee).to.equal(3000);
    });

    it("beforeSwap should apply decay implicitly on swap if decay timestamp passed natively", async function() {
      await mine(15);
      // transition to 1
      await hook.connect(proxy).transitionState(rvm.address, originChainId, originPool, 100, 1);
      expect(await hook.currentState()).to.equal(1);

      // Fast forward > 1 hour
      await time.increase(3601);

      // Trigger beforeSwap -> it should decay inside the swap
      const dummyParams = { zeroForOne: true, amountSpecified: 0, sqrtPriceLimitX96: 0 };
    await poolManager.swap(livePoolKey, dummyParams, "0x");
      
      expect(await hook.currentState()).to.equal(0); // Prove decay was run internally

      // Should have charged 3000 (0) and not 10000 (1) because it decayed right before setting
      const lpFee = await poolManager.lastFee();
      expect(lpFee).to.equal(3000); 
    });

  });
});