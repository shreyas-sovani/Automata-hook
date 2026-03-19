# **Product Requirements Document: AutomataHook v3.1 (Final)**

## **1\. Executive Summary**

**Name:** AutomataHook

**Core Thesis:** A Uniswap v4 Hook on Unichain Sepolia that dynamically shifts its fee regime (e.g., Neutral to Risk-Off) based on macroeconomic cross-chain events detected natively by Reactive Network.

**The Edge:** Zero off-chain infrastructure. The system is 100% smart-contract driven, utilizing ReactVM as a decentralized sensory layer and the Reactive Relayer as the execution trigger.

## **2\. System Architecture & The "Happy Path"**

1. **Origin (Unichain Sepolia):** A deterministic SwapEmitter contract emits a WhaleDump event. (We use this instead of a live pool to guarantee a flawless, on-demand demo without requiring millions in testnet liquidity).  
2. **Sensory Layer (Reactive Testnet):** AutomataBrain running in ReactVM catches the log. It formats a purely static payload and emits a Callback event.  
3. **Relay (Infrastructure):** The Reactive Callback Proxy picks up the event, injects the ReactVM ID into the first argument, and submits the transaction to Unichain Sepolia.  
4. **Execution Layer (Unichain Sepolia):** AutomataHook verifies the proxy caller, validates the ReactVM ID, checks hysteresis (min-dwell) and versioning, and updates the Uniswap v4 dynamic fee.

---

## **3\. Smart Contract Specifications**

## **3.1. SwapEmitter.sol (Deployed on Unichain Sepolia)**

A dead-simple deterministic trigger for the demo.

Solidity

contract SwapEmitter {  
    event WhaleDump(address indexed originPool, uint256 notionalVolume);  
      
    function emitDump(address originPool, uint256 notionalVolume) external {  
        emit WhaleDump(originPool, notionalVolume);  
    }  
}

## **3.2. AutomataBrain.sol (Deployed on ReactVM)**

Handles VM detection and formats a strictly static ABI payload to prevent offset corruption when the relayer injects the rvmId.

* **State:** bool private vm;, address public unichainHook;  
* **Constructor:**  
* Solidity

constructor(address \_service, address \_swapEmitter, address \_unichainHook) {  
    unichainHook \= \_unichainHook;

    // ReactVM Detection via extcodesize  
    uint256 size;  
    assembly { size := extcodesize(0x0000000000000000000000000000000000fffFfF) }  
    vm \= (size \== 0); 

    if (\!vm) {  
        ISubscriptionService(\_service).subscribe(  
            11155111, // Sepolia  
            \_swapEmitter,  
            keccak256("WhaleDump(address,uint256)"),  
            REACTIVE\_IGNORE, REACTIVE\_IGNORE, REACTIVE\_IGNORE  
        );  
    }  
}

*   
*   
* **React Logic:**  
* Solidity

function react(LogRecord calldata log) external vmOnly {  
    // Parse the originPool from topic\_1  
    address originPool \= address(uint160(uint256(log.topic\_1)));  
    uint64 version \= uint64(log.block\_number); // Use block number as monotonic version  
    uint8 newState \= 1; // 1 \= Risk-Off

    // CRITICAL FIX: Flattened static types. No dynamic bytes.  
    // address(0) is the placeholder for the 160-bit Relayer injection.  
    bytes memory callbackPayload \= abi.encodeWithSelector(  
        IAutomataHook.transitionState.selector,  
        address(0),   
        uint256(11155111), // originChainId  
        originPool,  
        version,  
        newState  
    );

    emit Callback(1301, unichainHook, 200000, callbackPayload); // 1301 \= Unichain Sepolia  
}

*   
* 

## **3.3. AutomataHook.sol (Deployed on Unichain Sepolia)**

The execution terminal. Stores the PoolKey, verifies the relayer, and controls the v4 dynamics.

* **Constants & State:**  
* Solidity

address public immutable REACTIVE\_CALLBACK\_PROXY;  
address public immutable EXPECTED\_REACT\_VM\_ADDRESS;  
IPoolManager.PoolKey public targetPoolKey;

uint8 public currentState;  
uint256 public lastTransitionBlock;  
uint256 public lastTransitionTimestamp;  
uint256 public constant T\_SAFE\_DECAY \= 1 hours;

mapping(bytes32 \=\> uint64) public lastVersionByOrigin;  
mapping(uint8 \=\> uint24) public stateFees; // e.g., 0 \=\> 3000 (0.3%), 1 \=\> 10000 (1.0%)  
uint256 public constant MIN\_DWELL\_BLOCKS \= 10;

*   
*   
* **The Single Entry Point (transitionState):**  
* Solidity

// RVM ID is safely injected into the first static parameter by the relayer.  
function transitionState(  
    address rvmId,   
    uint256 originChainId,   
    address originPool,   
    uint64 version,   
    uint8 newState  
) external {  
    // 1\. Strict Authentication  
    require(msg.sender \== REACTIVE\_CALLBACK\_PROXY, "Only Reactive Proxy");  
    require(rvmId \== EXPECTED\_REACT\_VM\_ADDRESS, "Invalid RVM Origin");

    // 2\. Replay Protection  
    bytes32 originId \= keccak256(abi.encode(originChainId, originPool));  
    require(version \> lastVersionByOrigin\[originId\], "Stale Payload");

    // 3\. Hysteresis (Min-Dwell)  
    if (lastTransitionBlock \!= 0\) {  
        require(block.number \>= lastTransitionBlock \+ MIN\_DWELL\_BLOCKS, "Hysteresis: Min dwell not met");  
    }

    // 4\. Update State  
    currentState \= newState;  
    lastVersionByOrigin\[originId\] \= version;  
    lastTransitionBlock \= block.number;  
    lastTransitionTimestamp \= block.timestamp;

    emit StateTransition(originId, newState, version);  
}

*   
*   
* **Uniswap v4 Hooks (beforeSwap & Decay):**  
* Solidity

function applyDecay() public {  
    if (currentState \!= 0 && block.timestamp \>= lastTransitionTimestamp \+ T\_SAFE\_DECAY) {  
        currentState \= 0;  
        lastTransitionTimestamp \= block.timestamp;  
        emit StateTransitionDecayed();  
    }  
}

function beforeSwap(address sender, IPoolManager.SwapParams calldata params, bytes calldata hookData) external override returns (bytes4) {  
    if (currentState \!= 0 && block.timestamp \>= lastTransitionTimestamp \+ T\_SAFE\_DECAY) {  
        applyDecay();  
    }

    uint24 fee \= stateFees\[currentState\];  
    poolManager.updateDynamicLPFee(targetPoolKey, fee);

    return BaseHook.beforeSwap.selector;  
}

*   
* 

---

## **4\. Demo Execution Plan (The "Win" Script)**

This is the exact sequence you will record for your 3-minute submission video.

1. **Setup (0:00 \- 0:30):** Show SwapEmitter verified on Sepolia, AutomataBrain verified on Reactscan, and AutomataHook on Unichain Explorer. Show the Unichain pool currently operating at currentState \= 0 (Fee: 0.3%).  
2. **The Trigger (0:30 \- 1:00):** From your terminal, execute SwapEmitter.emitDump() on Sepolia.  
3. **The Reactive Magic (1:00 \- 1:45):** Open Reactscan. Show the AutomataBrain picking up the log and emitting the Callback event. Explain that the ReactVM is autonomously acting as a cross-chain oracle.  
4. **The Execution (1:45 \- 2:30):** Open the Unichain Explorer. Show the incoming transaction from the Reactive Callback Proxy. Open the transaction logs to prove transitionState was called successfully, rvmId was verified, and StateTransition to currentState \= 1 was emitted.  
5. **The Proof (2:30 \- 3:00):** Execute a dummy swap against the Unichain pool. Show the transaction trace proving poolManager.updateDynamicLPFee was called with the new 1.0% fee, successfully capturing the LVR.

## **Deliverables Checklist for the Dev:**

* \[ \] Write the 3 contracts exactly as specified above. No dynamic bytes in the callback\!  
* \[ \] Deploy SwapEmitter (Sepolia), AutomataBrain (Kopli), and AutomataHook (Unichain Sepolia).  
* \[ \] Initialize targetPoolKey in AutomataHook to point to a valid Unichain test pool.  
* \[ \] Run the demo script. Record. Win.

