// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Dummy interfaces for Uniswap v4 Hook standard since we are implementing a simplified prototype
interface IPoolManager {
    struct PoolKey {
        address currency0;
        address currency1;
        uint24 fee;
        int24 tickSpacing;
        address hooks;
    }
    struct SwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }

    function updateDynamicLPFee(PoolKey calldata key, uint24 newDynamicLPFee) external;
}

abstract contract BaseHook {
    function beforeSwap(address sender, IPoolManager.SwapParams calldata params, bytes calldata hookData) external virtual returns (bytes4);
}

contract AutomataHook is BaseHook {
    address public immutable REACTIVE_CALLBACK_PROXY;  
    address public immutable EXPECTED_REACT_VM_ADDRESS;  
    IPoolManager.PoolKey public targetPoolKey;
    IPoolManager public poolManager;

    uint8 public currentState;  
    uint256 public lastTransitionBlock;  
    uint256 public lastTransitionTimestamp;  
    uint256 public constant T_SAFE_DECAY = 1 hours;

    mapping(bytes32 => uint64) public lastVersionByOrigin;  
    mapping(uint8 => uint24) public stateFees; // e.g., 0 => 3000 (0.3%), 1 => 10000 (1.0%)  
    uint256 public constant MIN_DWELL_BLOCKS = 10;

    event StateTransition(bytes32 indexed originId, uint8 newState, uint64 version);
    event StateTransitionDecayed();
    event TransitionAttempt(address indexed caller, address indexed rvmId, uint256 originChainId, address originPool, uint64 version, uint8 newState);
    event DynamicFeeApplied(uint8 indexed state, uint24 fee);

    constructor(
        address _proxy, 
        address _rvmExpected, 
        IPoolManager _poolManager,
        IPoolManager.PoolKey memory _key
    ) {
        REACTIVE_CALLBACK_PROXY = _proxy;
        EXPECTED_REACT_VM_ADDRESS = _rvmExpected;
        poolManager = _poolManager;
        targetPoolKey = _key;

        stateFees[0] = 3000;
        stateFees[1] = 10000;
        currentState = 0;
    }

    // RVM ID is safely injected into the first static parameter by the relayer.  
    function transitionState(  
        address rvmId,   
        uint256 originChainId,   
        address originPool,   
        uint64 version,   
        uint8 newState  
    ) external {  
        emit TransitionAttempt(msg.sender, rvmId, originChainId, originPool, version, newState);

        // 1. Strict Authentication  
        require(msg.sender == REACTIVE_CALLBACK_PROXY, "Only Reactive Proxy");  
        require(rvmId == EXPECTED_REACT_VM_ADDRESS, "Invalid RVM Origin");

        // 2. Replay Protection  
        bytes32 originId = keccak256(abi.encode(originChainId, originPool));  
        require(version > lastVersionByOrigin[originId], "Stale Payload");

        // 3. Hysteresis (Min-Dwell)  
        if (lastTransitionBlock != 0) {  
            require(block.number >= lastTransitionBlock + MIN_DWELL_BLOCKS, "Hysteresis: Min dwell not met");  
        }

        // 4. Update State  
        currentState = newState;  
        lastVersionByOrigin[originId] = version;  
        lastTransitionBlock = block.number;  
        lastTransitionTimestamp = block.timestamp;

        emit StateTransition(originId, newState, version);  
    }

    function applyDecay() public {  
        if (currentState != 0 && block.timestamp >= lastTransitionTimestamp + T_SAFE_DECAY) {  
            currentState = 0;  
            lastTransitionTimestamp = block.timestamp;  
            emit StateTransitionDecayed();  
        }  
    }

    function beforeSwap(address sender, IPoolManager.SwapParams calldata params, bytes calldata hookData) external override returns (bytes4) {  
        require(msg.sender == address(poolManager), "Only PoolManager");

        if (currentState != 0 && block.timestamp >= lastTransitionTimestamp + T_SAFE_DECAY) {  
            applyDecay();  
        }

        uint24 fee = stateFees[currentState];  
        poolManager.updateDynamicLPFee(targetPoolKey, fee);
        emit DynamicFeeApplied(currentState, fee);

        return BaseHook.beforeSwap.selector;  
    }
}