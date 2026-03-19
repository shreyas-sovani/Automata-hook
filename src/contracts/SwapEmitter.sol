// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SwapEmitter {  
    event WhaleDump(address indexed originPool, uint256 notionalVolume);  
      
    function emitDump(address originPool, uint256 notionalVolume) external {  
        emit WhaleDump(originPool, notionalVolume);  
    }  
}