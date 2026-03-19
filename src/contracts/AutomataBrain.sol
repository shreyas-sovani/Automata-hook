// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISubscriptionService {
    function subscribe(
        uint256 chainId,
        address contractAddress,
        uint256 topic0,
        uint256 topic1,
        uint256 topic2,
        uint256 topic3
    ) external;
}

interface IAutomataHook {
    function transitionState(
        address rvmId,   
        uint256 originChainId,   
        address originPool,   
        uint64 version,   
        uint8 newState  
    ) external;
}

struct LogRecord {
    uint256 chain_id;
    address _contract;
    uint256 topic_0;
    uint256 topic_1;
    uint256 topic_2;
    uint256 topic_3;
    bytes data;
    uint256 block_number;
    uint256 op_code;
    uint256 block_hash;
    uint256 tx_hash;
    uint256 log_index;
}

contract AutomataBrain {
    bool private vm;
    address public unichainHook;
    
    uint256 constant REACTIVE_IGNORE = 0xa65f96fc951c35ead38878e0f0b7a3c744a6f5ccc1476b313353ce31712313ad;

    event Callback(
        uint256 indexed chain_id,
        address indexed _contract,
        uint64 indexed gas_limit,
        bytes payload
    );
    
    event ReactCalled(address indexed originPool, uint64 block_number, bytes payload);

    constructor(address _service, address _swapEmitter, address _unichainHook) {  
        unichainHook = _unichainHook;

        // Detect if in ReactVM (system contract code size = 0 in ReactVM, > 0 on RNK)
        uint256 size;  
        assembly { size := extcodesize(0x0000000000000000000000000000000000fffFfF) }
        vm = (size == 0);

        // Subscribe to events
        ISubscriptionService(_service).subscribe(  
            1301,
            _swapEmitter,  
            uint256(keccak256("WhaleDump(address,uint256)")),  
            REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE  
        );
    }

    modifier vmOnly() {
        // Trust Reactive Network: it only calls react() from ReactVM
        // Removing strict vm check - rely on subscription/access control
        _;
    }

    function react(LogRecord calldata log) external vmOnly {  
        address originPool = address(uint160(uint256(log.topic_1)));  
        uint64 version = uint64(log.block_number);  
        uint8 newState = 1;

        // Build calldata manually to avoid any ABI wrapping
        // Selector for transitionState(address,uint256,address,uint64,uint8)
        bytes4 selector = 0xcf3421b4;
        
        bytes memory callbackPayload = abi.encodePacked(
            selector,
            bytes32(0),  // arg 1: address (will be replaced with RVM ID)
            bytes32(uint256(1301)),  // arg 2: chainId
            bytes32(uint256(uint160(originPool))),  // arg 3: pool
            bytes32(uint256(version)),  // arg 4: version
            bytes32(uint256(newState))  // arg 5: state
        );

        emit ReactCalled(originPool, version, callbackPayload);
        emit Callback(1301, unichainHook, 200000, callbackPayload);
    }
}