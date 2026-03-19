// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../AutomataBrain.sol";

contract DummySubscriptionService is ISubscriptionService {
    bool public subscribed;
    
    function subscribe(
        uint256 chainId,
        address contractAddress,
        uint256 topic0,
        uint256 topic1,
        uint256 topic2,
        uint256 topic3
    ) external override {
        subscribed = true;
    }
}
