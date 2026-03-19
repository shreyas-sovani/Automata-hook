// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../AutomataHook.sol";

contract DummyPoolManager is IPoolManager {
    uint24 public lastFee;

    function updateDynamicLPFee(PoolKey calldata key, uint24 newDynamicLPFee) external override {
        lastFee = newDynamicLPFee;
    }

    function initialize(PoolKey calldata key, uint160 sqrtPriceX96) external {
        // Mock pool initialization
    }

    function modifyLiquidity(PoolKey calldata key, int256 liquidityDelta) external {
        // Mock liquidity addition
    }

    function swap(PoolKey calldata key, SwapParams calldata params, bytes calldata hookData) external {
        if (key.hooks != address(0)) {
            BaseHook(key.hooks).beforeSwap(msg.sender, params, hookData);
        }
    }
}
