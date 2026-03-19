---
title: Debugging
sidebar_position: 14
description: The page dedicated to debugging of most frequent errors and issues on Reactive Network.
slug: /debugging
hide_title: true
---

![Debugging Image](../docs/img/debugging.jpg)

## Overview

The debugging page is dedicated to key operational and troubleshooting details for Reactive Network and beyond. Use it as a quick reference when setting up or troubleshooting your deployments.

## Callback Structure

Callbacks **must include at least one argument** — the first slot **must always be left for an RVM address**. Omitting it will cause the call to fail. Reactive automatically overwrites the first 160 bits of the payload with the relevant **RVM ID** (the deployer’s address).

Callback payload example:

```solidity
bytes memory payload = abi.encodeWithSignature(
    "stop(address,address,address,bool,uint256,uint256)",
    address(0),
    pair,
    client,
    token0,
    coefficient,
    threshold
);
emit Callback(chain_id, stop_order, CALLBACK_GAS_LIMIT, payload);
```

[More on Callbacks →](events-and-callbacks.md#callbacks-to-destination-chains)

## Contract Inactive

If you see `Contract Status: Inactive` on Reactscan, it means the contract doesn’t have enough funds to cover gas for reactive transactions. Both **destination** and **reactive contracts** must hold sufficient balance to stay active.

![Debugging Image](../docs/img/contract-inactive.png)

You can either fund the relevant contract on deployment:

```bash
forge create --broadcast --rpc-url $RPC_URL --private-key $PRIVATE_KEY $CONTRACT_PATH --value $VALUE --constructor-args $ARG1 $ARG2 ...
```

Or transfer funds manually after deployment, calling `coverDebt()` afterward:

```bash
cast send $CONTRACT_ADDR --rpc-url $RPC_URL --private-key $PRIVATE_KEY --value $VALUE
```

```bash
cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $CONTRACT_ADDR "coverDebt()"
```

You can verify a contract’s balance anytime on Reactscan or via Foundry cast command:

```bash
cast balance $CONTRACT_ADDR --rpc-url $RPC_URL
```

To check the outstanding debt, query the relevant proxy contract (`0x0000000000000000000000000000000000fffFfF` on Reactive):

```bash
cast call $PROXY_ADDR "debts(address)" $CONTRACT_ADDR --rpc-url $RPC_URL | cast to-dec
```

[More on Reactive Economy →](economy.md)

## Getting Testnet lREACT

### Reactive Faucet

To obtain testnet **lREACT**, send **ETH** to one of the Reactive faucet contracts:

```json
Ethereum Sepolia: 0x9b9BB25f1A81078C544C829c5EB7822d747Cf434

Base Sepolia: 0x2afaFD298b23b62760711756088F75B7409f5967
```

The exchange rate is **1:100** — for each **ETH** sent, you receive **100 lREACT**. You can make the transfer using **MetaMask** or any Ethereum-compatible wallet.

:::info[Important]
**Do not** send more than **5 ETH** in a single transaction. Any excess will be **lost**. Maximum per request: **5 ETH → 500 lREACT**.
:::

### ReacDEFI Swap

You can also swap ETH for lREACT directly using [ReacDEFI](https://reacdefi.app/markets#testnet-faucet). Select the desired lREACT amount, and the app will calculate the required ETH. An Ethereum/Base Sepolia wallet (MetaMask or Coinbase) must be connected.

### Terminal Request

You can also request lREACT by calling `request()` on one of the faucet contracts:

```bash
cast send 0x9b9BB25f1A81078C544C829c5EB7822d747Cf434 \
  --rpc-url $ETHEREUM_SEPOLIA_RPC \
  --private-key $ETHEREUM_SEPOLIA_PRIVATE_KEY \
  "request(address)" $CONTRACT_ADDR \
  --value 0.1ether
```

```bash
cast send 0x2afaFD298b23b62760711756088F75B7409f5967 \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $BASE_SEPOLIA_PRIVATE_KEY \
  "request(address)" $CONTRACT_ADDR \
  --value 0.1ether
```

[More on Reactive Faucet →](reactive-mainnet.mdx#get-testnet-react)

## Reactive Faucet Issue

If you’ve sent **ETH** to the Reactive Faucet at `0x9b9BB25f1A81078C544C829c5EB7822d747Cf434` (Ethereum Sepolia) or `0x2afaFD298b23b62760711756088F75B7409f5967` (Base Sepolia) but haven’t received **lREACT** within a few minutes, the faucet might be experiencing a temporary issue. Report it in our [General Telegram channel](https://t.me/reactivedevs/1). You will receive your test lREACT once the issue is resolved.

## Nonce & Gas Price Issue

When encountering the `Replacement transaction underpriced` error, it means a new transaction is trying to replace a pending one with an equal or lower gas price. To fix this, first check your current **nonce**:

```bash
cast nonce --rpc-url $REACTIVE_RPC $CONTRACT_ADDR
```

Then resend the transaction with the same nonce, but specify higher gas prices using the `--priority-gas-price` and `--gas-price` flags:

```bash
cast send --rpc-url $REACTIVE_RPC --private-key $PRIVATE_KEY --priority-gas-price $VALUE --gas-price $VALUE --nonce $VALUE $CONTRACT_ADDR …
```

## MetaMask Smart Transactions Issue

When trying to perform a transaction on Reactive Network, a bridge transfer or faucet claim, MetaMask may show a message like `Smart Transaction interrupted — this transaction was going to fail` or the transaction may never appear on-chain.

MetaMask has a feature called **Smart Transactions**, which routes transactions through a special **“smart address”** instead of your regular wallet address.
These smart contracts are not deployed on the **Reactive Network**, so any operations relying on direct wallet transactions (like our bridge or faucet) will fail.

You will need to disable Smart Transactions in MetaMask:

1. Open MetaMask.
2. Tap the **menu icon** (☰) in the top-right corner.
3. Go to **Settings → Advanced.**
4. Find **Smart Transactions.**
5. Toggle it **OFF.**

After this, your transactions will go through the regular route and should work correctly.

[More on MetaMask's Smart Transactions →](https://support.metamask.io/manage-crypto/transactions/smart-transactions/)---
title: Demos
sidebar_position: 12
description: Practical Reactive Network demos covering event subscriptions, log monitoring, dynamic callbacks, and real-world automation examples including Uniswap V2 stop orders.
slug: /demos
hide_title: true
---

![Demos Image](img/demos.jpg)

## Overview

This section contains practical demos of how Reactive Network enables event-driven, cross-chain smart contract automation. Each demo highlights a specific pattern from basic event callbacks to advanced DeFi protection mechanisms.

## Reactive Network Demo

The [Reactive Network Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/basic) is the starting point. It demonstrates the lifecycle of a Reactive Contract: an event emitted on an origin chain is detected by a Reactive Contract, which then triggers a callback on a destination chain. If you’re new to Reactive Network, begin here.

## Uniswap V2 Stop Order Demo

The [Uniswap V2 Stop Order Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/uniswap-v2-stop-order) implements automated stop orders on Uniswap V2 liquidity pools. A Reactive Contract subscribes to `Sync` events from a Uniswap pair. When the exchange rate crosses a user-defined threshold, it triggers a callback that executes the swap on the destination chain. This demo shows how price-based automation can run without off-chain bots.

## Uniswap V2 Stop-Loss & Take-Profit Orders Demo

The [Uniswap V2 Stop-Loss & Take-Profit Orders Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/uniswap-v2-stop-take-profit-order) expands on stop orders by supporting both stop-loss and take-profit strategies within a personal deployment. A user-owned Reactive Contract monitors pair reserve updates and triggers execution when thresholds are crossed. Each user deploys their own callback and Reactive Contracts, ensuring isolated order management and full control. This example demonstrates structured, event-driven trade automation directly tied to on-chain liquidity changes.

## Aave Liquidation Protection Demo

The [Aave Liquidation Protection Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/aave-liquidation-protection) shows how to automate position protection on Aave. A Reactive Contract subscribes to periodic CRON events and triggers health checks for a user’s lending position. If the health factor drops below a defined threshold, the callback contract executes protection actions — depositing collateral, repaying debt, or both. This demo illustrates time-based automation for DeFi risk management.

## Approval Magic Demo

The [Approval Magic Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/approval-magic) shows subscription-based automation triggered by ERC-20 approval events. A Reactive Contract monitors approval logs, while a service contract manages user registrations. When an approval is detected, the system can automatically initiate follow-up actions such as swaps or exchanges. This demo highlights how event-centric logic can simplify multi-step token workflows.

## Hyperlane Demo

The [Hyperlane Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/hyperlane) shows cross-chain communication using Hyperlane alongside Reactive Network. This example shows how Reactive Network can integrate with external messaging protocols for two-way cross-chain interaction.

## CRON Demo

The [Cron Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/cron) shows time-based automation using Reactive Network’s built-in CRON events. Instead of waiting for external transactions, the Reactive Contract subscribes to periodic system-emitted events and executes logic on a fixed schedule. This pattern is useful for recurring tasks such as scheduled updates, reward distributions, or regular DeFi position checks.
---
title: Economy
sidebar_position: 6
description: Learn how Reactive Contracts pay for execution and cross-chain callbacks, including REACT funding, transaction fees, and callback pricing.
slug: /economy
hide_title: true
---

![Economy](./img/economy.jpg)

## Overview

This section explains how Reactive Contracts pay for execution and cross-chain callbacks, including REACT funding, transaction fees, and callback pricing. RVM transactions and callbacks are executed first and accounted for later. Contracts must maintain sufficient balances to remain active.

## RVM Transactions 

RVM transactions do not include a gas price at execution time. Fees are calculated and charged later using the base fee of a subsequent block (typically the next block). Because accounting is aggregated at the block level, Reactscan can't associate fees with individual RVM transactions.

:::info[Max Gas Limit]
The maximum gas limit for RVM transactions is 900,000 units.
:::

The Reactive transaction fee is calculated as:

$$
fee = BaseFee ⋅ GasUsed
$$

Where:

- `BaseFee` — base fee per gas unit in the accounting block
- `GasUsed` — gas consumed during execution

:::info[Reactive Network Transactions]
RNK transactions follow the standard EVM gas model.
:::

### Direct Transfers

Reactive Contracts must be funded in REACT before executing RVM transactions.

Fund a contract:

```bash
cast send $CONTRACT_ADDR \
  --rpc-url $REACTIVE_RPC \
  --private-key $REACTIVE_PRIVATE_KEY \
  --value 0.1ether
```

Then settle outstanding debt:

```bash
cast send \
  --rpc-url $REACTIVE_RPC \
  --private-key $REACTIVE_PRIVATE_KEY \
  $CONTRACT_ADDR "coverDebt()"
```

:::info[Contract Status]
Contract status is available on [Reactscan](https://reactscan.net/).

- `active` — contract executes normally
- `inactive` — outstanding debt must be settled
:::

### System Contract Deposits

Contracts can be funded through the system contract using `depositTo()`. The sender pays the transaction fee, and any outstanding debt is settled automatically.

```bash
cast send \
  --rpc-url $REACTIVE_RPC \
  --private-key $REACTIVE_PRIVATE_KEY \
  $SYSTEM_CONTRACT_ADDR "depositTo(address)" \
  $CONTRACT_ADDR \
  --value 0.1ether
```

:::info[System Contract]
On Reactive Network, the system contract and callback proxy share the same address: `0x0000000000000000000000000000000000fffFfF`.
:::

## Callback Pricing

Callback costs depend on the destination network and current base fees. The callback price $$p_{callback}$$ is calculated as:

$$
p_{callback} = p_{base} ⋅ C ⋅ (g_{callback} + K)
$$

Where:

- $$p_{base}$$ — base gas price (`tx.gasprice` or `block.basefee`)
- $$C$$ — destination-network pricing coefficient
- $$g_{callback}$$ — callback gas usage
- $$K$$ — fixed gas surcharge

## Callback Payment

Callbacks use the same payment model as RVM transactions. Contracts without sufficient funds are blocklisted and can't execute transactions or callbacks.

:::warning[Callback Gas Limit]
Reactive Network enforces a minimum callback gas limit of 100,000 gas. Callback requests below this threshold are ignored, as this minimum ensures sufficient gas for internal audits and computations required to process the callback.
:::

### Direct Transfers

Fund a callback contract:

```bash
cast send $CALLBACK_ADDR \
  --rpc-url $DESTINATION_RPC \
  --private-key $DESTINATION_PRIVATE_KEY \
  --value 0.1ether
```

Then settle outstanding debt:

```bash
cast send \
  --rpc-url $DESTINATION_RPC \
  --private-key $DESTINATION_PRIVATE_KEY \
  $CALLBACK_ADDR "coverDebt()"
```

### Callback Proxy Deposits

Callback contracts can be funded through the callback proxy using `depositTo()`. Debt is settled automatically.

```bash
cast send \
  --rpc-url $DESTINATION_RPC \
  --private-key $DESTINATION_PRIVATE_KEY \
  $CALLBACK_PROXY_ADDR "depositTo(address)" \
  $CALLBACK_ADDR \
  --value 0.1ether
```

:::tip[On-The-Spot Payment]
Implementing `pay()` or inheriting from `AbstractPayer` enables automatic settlement. The callback proxy calls `pay()` when a callback creates debt. The standard implementation verifies the caller, checks balances, and settles the debt.
:::

## Callback Contract Balance

### Balance

Retrieve the balance of a callback contract:

```bash
cast balance $CONTRACT_ADDR --rpc-url $DESTINATION_RPC
```

### Debt

Query the debt recorded by the callback proxy:

```bash
cast call $CALLBACK_PROXY_ADDR "debts(address)" $CONTRACT_ADDR --rpc-url $DESTINATION_RPC | cast to-dec
```

### Reserves

Retrieve reserves held by the callback proxy:

```bash
cast call $CALLBACK_PROXY_ADDR "reserves(address)" $CONTRACT_ADDR --rpc-url $DESTINATION_RPC | cast to-dec
```

## Reactive Contract Balance

### Balance

Retrieve the REACT balance of a reactive contract:

```bash
cast balance $CONTRACT_ADDR --rpc-url $REACTIVE_RPC
```

### Debt

Query the debt recorded by the system contract:

```bash
cast call $SYSTEM_CONTRACT_ADDR "debts(address)" $CONTRACT_ADDR --rpc-url $REACTIVE_RPC | cast to-dec
```

### Reserves

Retrieve reserves held by the system contract:

```bash
cast call $SYSTEM_CONTRACT_ADDR "reserves(address)" $CONTRACT_ADDR --rpc-url $REACTIVE_RPC | cast to-dec
```
---
title: Events & Callbacks
sidebar_position: 9
description: Learn how Reactive Contracts process events and trigger cross-chain callback transactions.
slug: /events-&-callbacks
hide_title: true
---

![Events and Callbacks Image](./img/events-and-callbacks.jpg)

## Overview

Reactive Contracts process on-chain events and trigger transactions on destination chains through callbacks. Contracts run inside isolated environments called [ReactVMs](./reactvm.md), where incoming events are processed and callback transactions are generated when conditions are met.

## Event Processing

To process events, a Reactive Contract must implement the `react()` function defined in the [IReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IReactive.sol) interface:

```solidity
// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

import './IPayer.sol';

interface IReactive is IPayer {
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
    ...
}
```

Reactive Network calls `react()` whenever a subscribed event is detected. The `LogRecord` structure contains the event metadata, including chain ID, contract address, topics, and event data.

Reactive Contracts execute inside a private ReactVM associated with the deployer's address. Contracts inside one ReactVM **can't** interact directly with contracts deployed by other users.

Below is an example `react()` function from the [Basic Reactive Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/basic/BasicDemoReactiveContract.sol):

```solidity
function react(LogRecord calldata log) external vmOnly {
    
    if (log.topic_3 >= 0.001 ether) {
        bytes memory payload = abi.encodeWithSignature("callback(address)", address(0));
        emit Callback(destinationChainId, callback, GAS_LIMIT, payload);
    }
}
```

[More on Events →](../education/module-1/how-events-work)

## Callbacks to Destination Chains

Reactive Contracts initiate transactions on destination chains by emitting `Callback` events, which are also part of the [IReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IReactive.sol) interface:

```solidity
event Callback(
    uint256 indexed chain_id,
    address indexed _contract,
    uint64 indexed gas_limit,
    bytes payload
);
```

When this event appears in the transaction trace, Reactive Network submits a transaction to the specified destination chain.

- **chain_id** — destination network
- **_contract** — target contract
- **gas_limit** — execution gas limit
- **payload** — encoded function call

:::info[Callback Authorization]
Reactive Network automatically replaces the first 160 bits of the callback payload with the ReactVM ID (the deployer's address). As a result, the first callback argument is always the ReactVM address (`address` type), regardless of how it is named in Solidity. This ensures that callbacks are tied to the correct Reactive Contract.
:::

### Example: Uniswap Stop Order Demo

Example callback payload construction from the [Uniswap Stop Order Reactive Contract](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/uniswap-v2-stop-order/UniswapDemoStopOrderReactive.sol):

```solidity
bytes memory payload = abi.encodeWithSignature(
    "stop(address,address,address,bool,uint256,uint256)",
    address(0),
    pair,
    client,
    token0,
    coefficient,
    threshold
);
triggered = true;
emit Callback(log.chain_id, stop_order, CALLBACK_GAS_LIMIT, payload);
```

The payload encodes the function call and parameters that will be executed on the destination chain.

[More on Callback Payment →](./economy#callback-payment)

[More on Callbacks →](../education/module-1/how-events-work#callbacks-to-destination-chains)
---
title: Hyperlane
sidebar_position: 3
description: Learn how to use Hyperlane Mailboxes as an alternative transport for cross-chain callbacks in Reactive Contracts.
slug: /hyperlane
hide_title: true
---

import MailboxAddressTable from "../../src/components/hyperlane-mailbox-table";

![Hyperlane Image](./img/hyperlane.jpg)

## Overview

Reactive Contracts send **cross-chain callback transactions** to destination chains. By default, callbacks are delivered through the Reactive **Callback Proxy**. Hyperlane Mailboxes provide an alternative transport for these callbacks. The Mailbox contract on each supported chain acts as the entry and exit point for cross-chain messages.

Reactive Contracts still listen to event logs and trigger actions in the same way, only the callback transport changes. Hyperlane transport is useful when:

- A chain does not yet support the Callback Proxy
- You need additional routing flexibility
- You want to integrate Reactive Contracts with existing Hyperlane-based systems

## Hyperlane Mailboxes

:::info[Hyperlane Demo]
See our [Hyperlane Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/hyperlane) to understand how to deploy contracts and send messages with Hyperlane mailboxes.
:::

<MailboxAddressTable />
---
sidebar_position: 1
title: Getting Started
description: Explore Reactive Network — an automation layer for EVM chains. Build Reactive Contracts — event-driven smart contracts for cross-chain, on-chain automation.
slug: /
hide_title: true
---

![Reactive Docs Image](./img/reactive-docs.jpg)

## Overview

Reactive Network is an EVM-compatible chain built around Reactive Contracts (RCs) — event-driven smart contracts for cross-chain, on-chain automation.

Reactive Contracts monitor event logs across EVM chains and execute Solidity logic automatically when conditions are met. Instead of waiting for users or bots to trigger transactions, RCs run continuously and decide when to send cross-chain callback transactions, essentially providing on-chain if-this-then-that automation for smart contracts.

This makes it possible to build conditional cross-chain workflows such as:

* Automated stop-loss and take-profit orders
* Liquidation protection
* Automated portfolio rebalancing
* Yield optimization
* Cross-chain workflows

## Step 1 — Reactive Basics

[Origins & Destinations →](./origins-and-destinations.mdx) Understand origin and destination chains and their Callback Proxy addresses.

[Hyperlane →](./hyperlane.mdx) Learn how cross-chain callbacks are transported using Hyperlane.

[Reactive Contracts →](./reactive-contracts.md) Learn how Reactive Contracts subscribe to events and trigger actions.

[ReactVM →](./reactvm.md) Understand ReactVM and how Reactive execution works.

[Economy →](./economy) Understand callback payments and Reactive's economy.

## Step 2 — Reactive Essentials

[Reactive Mainnet & Lasna Testnet →](./reactive-mainnet.mdx) Connect to Reactive Mainnet or Lasna Testnet.

[Reactive Library →](./reactive-lib.mdx) Use Reactive abstract contracts and interfaces.

[Events & Callbacks →](./events-and-callbacks.md) Learn how event subscriptions trigger cross-chain callbacks. 

[Subscriptions →](./subscriptions.md) Configure event subscriptions.

[RNK RPC Methods →](./rnk-rpc-methods.md) Reference RPC methods for Reactive nodes.

## Step 3 — Reactive Building

[Reactive Demos →](./demos.md) Explore working examples. 

[Reactive Demos on GitHub →](https://github.com/Reactive-Network/reactive-smart-contract-demos) Clone demo projects and start building.

## Extra

[Reactscan →](./reactscan.md) Explore Reactive transactions and contracts.

[Reactive Education →](../education/introduction/index.md) Take the Reactive technical course.

[Debugging →](debugging.md) Troubleshoot common issues.

[Contacts →](../contacts/index.md) Get support and connect with the community.

---
sidebar_position: 1
title: Reactive Network Official Addresses
slug: /addresses
hide_title: true
unlisted: true
---

# Addresses

This page contains all blockchain addresses related to the Reactive Network.

| Chain            | Address                                      | Description                       |
|------------------|----------------------------------------------|-----------------------------------|
| Ethereum Mainnet | `0x6fBb0C7A0ec62007013748e47823C239Dd48BfEf` | Bridge PRQ\<\>REACT               |
| Ethereum Mainnet | `0x42458259d5c85fB2bf117f197f1Fef8C3b7dCBfe` | Bridge WREACT\<\>REACT            |
| BNB Smart Chain  | `0x577432505892F7B18a26166247a7456B814E2f68` | Bridge PRQ BNB>REACT              |
| Reactive Mainnet | `0x4F55172b66bab5e58DB20bd4d25e9301A22f2979` | Reactive part of PRQ\<\>REACT     |
| Reactive Mainnet | `0x1aa8615D92e0F5b65Bf02939C116db3AA654D38A` | Reactive part of  WREACT\<\>REACT |
| Reactive Mainnet | `0x1176172108b1611f7A1d2F7b0A6f889650F99EAB` | Reactive part of  PRQ BNB>REACT   |
---
title: Origins & Destinations
sidebar_position: 2
description: Learn how Reactive Contracts subscribe to event logs on origin chains and send callback transactions to destination chains.
slug: /origins-and-destinations
hide_title: true
---

import MainnetChainTable from "../../src/components/origins-destinations";
import TestnetChainTable from "../../src/components/origins-destinations-testnet";

![Origins & Destinations Image](./img/origins-and-destinations.jpg)

## Overview

Reactive Contracts (RCs) can **listen to event logs on one chain** and **trigger actions on another**. To describe that flow, we use two roles:

- **Origin** — the chain where events happen and event logs are read from (the event source).
- **Destination** — the chain where Reactive Network delivers a callback transaction (the chain where state changes happen).

Origins and destinations don’t have to be the same. A single Reactive Contract can subscribe to events from multiple origin chains, and it can send callbacks to one or more destination chains. Your Solidity logic can also choose the destination conditionally.

## Callback Proxy Address

Callbacks are delivered to destination chains via a **Callback Proxy** contract. Its job is to make callback transactions verifiable and safe for destination-side contracts.

A destination contract can validate a callback by checking:

1. **The sender is the Callback Proxy** (so the call is coming through the expected entry point).
2. **The embedded RVM ID matches the intended Reactive Contract** (so the callback is tied to the correct RC).

:::info[Hyperlane]
Some networks can’t act as destination chains yet because the Callback Proxy contract hasn’t been deployed there. In that case, use [Hyperlane](./hyperlane) as the transport for cross-chain callbacks.
:::

## Mainnet Chains

:::info[Origin/Destination]
Origin is the chain where events originate (and are read from). Destination is the chain where callbacks are delivered in response to those events. Mainnets and testnets must not be mixed: if the origin is a mainnet, the destination must also be a mainnet.
:::

<MainnetChainTable />

## Testnet Chains

:::info[Origin/Destination]
Origin is the chain where events originate (and are read from). Destination is the chain where callbacks are delivered in response to those events. Mainnets and testnets must not be mixed: if the origin is a testnet, the destination must also be a testnet.
:::

<TestnetChainTable />

[//]: # (emojis for status ✅ ➖ ⌛)

[//]: # (:::info[Callbacks])

[//]: # (Not all origin chains are compatible as destination chains. Please refer to the table below before implementing callbacks.)

[//]: # (:::)
---
title: Reactive Contracts
sidebar_position: 4
description: Learn about Reactive Contracts (RCs) — event-driven smart contracts for cross-chain, on-chain automation that monitor event logs and trigger callback transactions.
slug: /reactive-contracts
hide_title: true
---

![Reactive Contracts Image](./img/reactive-contracts.jpg)

## Overview

Reactive Contracts (RCs) are event-driven smart contracts for cross-chain, on-chain automation. They monitor event logs across EVM chains, execute Solidity logic when subscribed events occur, and can trigger cross-chain callback transactions.

RCs define which chains, contracts, and events to monitor and operate autonomously based on on-chain events rather than user transactions or bots.

## Deployment

Reactive Contracts deploy in two environments:

- **Reactive Network (RNK)** — the public chain where EOAs interact with the contract and subscriptions are managed

- **ReactVM (RVM)** — a private execution environment where event processing takes place

Both copies use identical bytecode but operate independently.

## State Separation

The two deployments do not share state. Constructor flags or runtime checks can be used to distinguish environments. A contract can detect execution inside ReactVM by calling the system contract — calls revert outside ReactVM. See our [demos](./demos.md) for details.

## ReactVM Limitations

Inside [ReactVM](./reactvm.md), Reactive Contracts can't access external systems directly. They receive event logs from Reactive Network and can send callback transactions to destination chains, but can't interact with external RPC endpoints or off-chain services.

## Verifying Reactive Contracts

Contracts can be verified during or after deployment using the Sourcify endpoint. Sourcify is a decentralized verification service that matches deployed bytecode with source code, making contracts auditable and transparent.

## Verify After Deployment

```bash
forge verify-contract \
--verifier sourcify \
--chain-id $CHAIN_ID \
$CONTRACT_ADDR $CONTRACT_NAME
```

Replace:

- `$CHAIN_ID` → `1597` (Reactive Mainnet) or `5318007` (Lasna Testnet)
- `$CONTRACT_ADDR` → deployed contract address
- `$CONTRACT_NAME` → contract name (e.g. `MyContract`)

## Verify on Deployment

```bash
forge create \
--verifier sourcify \
--verify \
--chain-id $CHAIN_ID \
--private-key $PRIVATE_KEY \
$PATH
```

Replace:

- `$CHAIN_ID` → `1597` (Reactive Mainnet) or `5318007` (Lasna Testnet)
- `$PATH` → e.g. `src/MyContract.sol:MyContract`
- `$PRIVATE_KEY` → deployer key

Example: 

```bash
forge create \
  --broadcast \
  --rpc-url $REACTIVE_RPC_URL \
  --private-key $REACTIVE_PRIVATE_KEY \
  --chain-id $REACTIVE_CHAIN_ID \
  --value 0.01ether \
  --verify \
  --verifier sourcify \
  src/.../MyContract.sol:MyContract \
  --constructor-args \
    $ARGUMENT_1 \
    $ARGUMENT_2 \
    $ARGUMENT_3 \
    # ...add more as needed
```

:::warning[Broadcast Error]
If you encounter the error below, your Foundry version doesn't expect the `--broadcast` flag for `forge create`. Remove `--broadcast` and retry.

```go
error: unexpected argument '--broadcast' found
```
:::

## Verified Contracts on Reactscan

After verification:

1. Open Reactscan ([Reactive Mainnet](https://reactscan.net/), [Lasna Testnet](https://lasna.reactscan.net/))
2. Navigate to your RVM
3. Open Contracts


![Image a](./img/verify-a.png)

4. Select the contract address

![Image b](./img/verify-b.png)

Successful verification shows:

```json
Contract Address: 0xc3e185561D2a8b04F0Fcd104A562f460D6cC503c
Status: VERIFIED (EXACT MATCH)
Compiler: 0.8.28
```

![Image c](./img/verify-c.png)

Verified contracts expose full source code with syntax highlighting and file structure.

[More on Reactive Contracts →](../education/module-1/reactive-contracts)
---
title: Reactive Library
sidebar_position: 8
description: Reference for the Reactive Library — abstract contracts and interfaces for building Reactive Contracts.
slug: /reactive-library
hide_title: true
---

import CronTable from "../../src/components/cron-table";

![Reactive Library](./img/reactive-lib.jpg)

## Overview

[Reactive Library](https://github.com/Reactive-Network/reactive-lib) provides abstract contracts and interfaces for building Reactive Contracts. The library includes components for subscriptions, callbacks, payments, and system contract interaction.

Install the library in your Foundry project:

```bash
forge install Reactive-Network/reactive-lib
```

## Abstract Contracts

### AbstractCallback

[AbstractCallback](https://github.com/Reactive-Network/reactive-lib/blob/main/src/abstract-base/AbstractCallback.sol) extends `AbstractPayer.sol` and provides callback authorization for Reactive Contracts.

The contract initializes:

- `rvm_id` — authorized ReactVM identifier
- `vendor` — callback proxy address

The `rvmIdOnly` modifier restricts functions to the authorized ReactVM.

```solidity
modifier rvmIdOnly(address _rvm_id) {
    require(rvm_id == address(0) || rvm_id == _rvm_id, 'Authorized RVM ID only');
    _;
}
```

The constructor sets the deploying ReactVM as the authorized `rvm_id` and registers the callback proxy as an authorized payment sender.

```solidity
constructor(address _callback_sender) {
    rvm_id = msg.sender;
    vendor = IPayable(payable(_callback_sender));
    addAuthorizedSender(_callback_sender);
}
```

### AbstractPausableReactive

[AbstractPausableReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/abstract-base/AbstractPausableReactive.sol) extends `AbstractReactive.sol` and provides pausable event subscriptions.

Subscriptions are defined using the `Subscription` struct, which specifies chain ID, contract address, and event topics.

The contract provides:

- `pause()` — unsubscribes all pausable subscriptions
- `resume()` — restores subscriptions

Access is restricted to the contract owner.

The constructor sets the deployer as the owner.

```solidity
constructor() {
    owner = msg.sender;
}
```

The `pause()` function unsubscribes all subscriptions returned by `getPausableSubscriptions()`:

```solidity
function pause() external rnOnly onlyOwner {
    require(!paused, 'Already paused');
    Subscription[] memory subscriptions = getPausableSubscriptions();
    for (uint256 ix = 0; ix != subscriptions.length; ++ix) {
        service.unsubscribe(
            subscriptions[ix].chain_id,
            subscriptions[ix]._contract,
            subscriptions[ix].topic_0,
            subscriptions[ix].topic_1,
            subscriptions[ix].topic_2,
            subscriptions[ix].topic_3
        );
    }
    paused = true;
}
```

The `resume()` function restores the same subscriptions:

```solidity
function resume() external rnOnly onlyOwner {
    require(paused, 'Not paused');
    Subscription[] memory subscriptions = getPausableSubscriptions();
    for (uint256 ix = 0; ix != subscriptions.length; ++ix) {
        service.subscribe(
            subscriptions[ix].chain_id,
            subscriptions[ix]._contract,
            subscriptions[ix].topic_0,
            subscriptions[ix].topic_1,
            subscriptions[ix].topic_2,
            subscriptions[ix].topic_3
        );
    }
    paused = false;
}
```

### AbstractPayer

[AbstractPayer](https://github.com/Reactive-Network/reactive-lib/blob/main/src/abstract-base/AbstractPayer.sol) provides payment and debt-settlement functionality for Reactive Contracts.

Features include:

- Authorized payment senders
- Vendor debt settlement
- Direct contract funding

The `authorizedSenderOnly` modifier restricts payment initiation to authorized senders.

```solidity
modifier authorizedSenderOnly() {
    require(senders[msg.sender], 'Authorized sender only');
    _;
}
```

The contract provides:

- `pay()` — transfers funds to the authorized sender
- `coverDebt()` — settles outstanding vendor debt

```solidity
function pay(uint256 amount) external authorizedSenderOnly {
    _pay(payable(msg.sender), amount);
}

function coverDebt() external {
    uint256 amount = vendor.debt(address(this));
    _pay(payable(vendor), amount);
}

function _pay(address payable recipient, uint256 amount) internal {
    require(address(this).balance >= amount, 'Insufficient funds');
    if (amount > 0) {
        (bool success,) = payable(recipient).call{value: amount}(new bytes(0));
        require(success, 'Transfer failed');
    }
}
```

Authorized senders are managed with:

```solidity
function addAuthorizedSender(address sender) internal {
    senders[sender] = true;
}

function removeAuthorizedSender(address sender) internal {
    senders[sender] = false;
}
```

The contract accepts direct transfers:

```solidity
receive() virtual external payable {
}
```

### AbstractReactive

[AbstractReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/abstract-base/AbstractReactive.sol) is the base contract for Reactive Contracts. It extends `AbstractPayer.sol` and implements `IReactive.sol`, providing access to the Reactive Network system contract and subscription service.

The contract defines two execution modes:

- `vmOnly` — ReactVM execution
- `rnOnly` — Reactive Network execution

These modes ensure functions run in the appropriate environment.

The constructor initializes the system contract as both the payment vendor and subscription service, and authorizes it for payment operations.

```solidity
constructor() {
    vendor = service = SERVICE_ADDR;
    addAuthorizedSender(address(SERVICE_ADDR));
    detectVm();
}
```

Execution mode is determined automatically using `detectVm()`, which checks whether the system contract is deployed.

```solidity
function detectVm() internal {
    uint256 size;
    // solhint-disable-next-line no-inline-assembly
    assembly { size := extcodesize(0x0000000000000000000000000000000000fffFfF) }
    vm = size == 0;
}
```

## Interfaces

### IPayable

[IPayable](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IPayable.sol) defines payment and debt-query functionality for Reactive Contracts.

- `receive()` — accepts direct payments
- `debt()` — returns the outstanding debt of a contract

```solidity
interface IPayable {
    receive() external payable;

    function debt(address _contract) external view returns (uint256);
}
```

### IPayer

[IPayer](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IPayer.sol) defines a minimal interface for initiating payments and receiving funds.

- `pay()` — initiates a payment
- `receive()` — accepts direct transfers

```solidity
interface IPayer {
    function pay(uint256 amount) external;

    receive() external payable;
}
```

### IReactive

[IReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IReactive.sol) defines the core interface for Reactive Contracts. It extends `IPayer.sol` and provides event notifications and the execution entry point.

The `LogRecord` struct contains event data delivered to the contract.

```solidity
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
```

The `Callback` event is emitted when a Reactive Contract triggers a callback transaction.

```solidity
event Callback(
   uint256 indexed chain_id,
   address indexed _contract,
   uint64 indexed gas_limit,
   bytes payload
);
```

The `react()` function processes event notifications.

```solidity
function react(LogRecord calldata log) external;
```

### ISubscriptionService

[ISubscriptionService](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/ISubscriptionService.sol) defines functions for managing event subscriptions. It extends `IPayable.sol` and allows Reactive Contracts to subscribe to or unsubscribe from event logs.

The `subscribe()` function registers a subscription with the specified event criteria.

```solidity
function subscribe(
    uint256 chain_id,
    address _contract,
    uint256 topic_0,
    uint256 topic_1,
    uint256 topic_2,
    uint256 topic_3
) external;
```

The `unsubscribe()` function removes a subscription matching the specified criteria.

```solidity
function unsubscribe(
    uint256 chain_id,
    address _contract,
    uint256 topic_0,
    uint256 topic_1,
    uint256 topic_2,
    uint256 topic_3
) external;
```

### ISystemContract

[ISystemContract](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/ISystemContract.sol) combines the functionality of `IPayable.sol` and `ISubscriptionService.sol`. It represents the Reactive Network system contract interface used for payments and subscription management.

```solidity
import './IPayable.sol';
import './ISubscriptionService.sol';

interface ISystemContract is IPayable, ISubscriptionService {
}
```

## System Contract

Reactive Network operations are handled by three core contracts:

[System Contract](https://github.com/Reactive-Network/system-smart-contracts/blob/main/src/SystemContract.sol):

- Handles payments for Reactive Contracts
- Manages contract access control (whitelist/blacklist)
- Emits cron events for periodic triggers

[Callback Proxy](https://github.com/Reactive-Network/system-smart-contracts/blob/main/src/CallbackProxy.sol):

- Delivers callback transactions to destination contracts
- Manages deposits, reserves, and debts
- Restricts callbacks to authorized Reactive Contracts
- Calculates callback gas costs and kickbacks

[AbstractSubscriptionService](https://github.com/Reactive-Network/system-smart-contracts/blob/main/src/AbstractSubscriptionService.sol):

- Manages event subscriptions
- Supports filtering by chain, contract, and topics
- Supports wildcard matching via `REACTIVE_IGNORE`
- Emits subscription update events

### CRON Functionality

The `SystemContract` provides a cron mechanism for time-based automation by emitting events at fixed block intervals. Reactive Contracts can subscribe to these events to implement scheduled execution without polling or external automation.

Only authorized validator root addresses can call `cron()`. Each call to `cron()` emits one or more `Cron` events depending on the divisibility of the current block number. Larger intervals produce less frequent events.

Each `Cron` event contains a single parameter:

- `number` — the current block number

<CronTable />
---
title: Reactive Mainnet / Lasna Testnet
sidebar_position: 7
description: RPC endpoints, chain IDs, and faucet instructions for Reactive Mainnet and Lasna Testnet.
slug: /reactive-mainnet
hide_title: true
---

import MainnetButton from "../../src/components/mainnet-button";
import LasnaButton from "../../src/components/lasna-button";

![Mainnet Testnet Image](./img/mainnet-testnet.jpg)

## Overview

Reactive Mainnet is the production network for Reactive Contracts. Lasna Testnet provides a testing environment for development and experimentation before mainnet deployment.

:::info[System Contract]
Reactive Mainnet and Lasna Testnet share the same system contract address:
`0x0000000000000000000000000000000000fffFfF`
:::

## Reactive Mainnet

Network parameters:

* **Network Name:** Reactive Mainnet
* **RPC URL:** https://mainnet-rpc.rnk.dev/
* **Chain ID:** 1597
* **Currency Symbol:** REACT
* **Block Explorer:** https://reactscan.net/

<MainnetButton />

<hr />

## Get Testnet REACT

### Reactive Faucet

To obtain **testnet REACT (lREACT)**, send **ETH** to one of the faucet contracts:

```json
Ethereum Sepolia: `0x9b9BB25f1A81078C544C829c5EB7822d747Cf434`

Base Sepolia: `0x2afaFD298b23b62760711756088F75B7409f5967`
```

Exchange rate: **1 ETH → 100 lREACT**.

Transfers can be made using MetaMask or any Ethereum-compatible wallet.

:::info[Important]
Do **not** send more than **5 ETH** per transaction.

- Maximum sent: **5 ETH**
- Maximum received: **500 lREACT**

Amounts above 5 ETH are **lost** and will not generate additional lREACT.
:::

### ReacDEFI Swap

You can swap ETH for lREACT using [ReacDEFI](https://reacdefi.app/markets#testnet-faucet):

1. Choose the amount of **lREACT**
2. Connect a Sepolia or Base Sepolia wallet
3. Confirm the transaction

### Terminal Request

You can request lREACT by calling `request(address)` on a faucet contract:

```bash
cast send 0x9b9BB25f1A81078C544C829c5EB7822d747Cf434 --rpc-url $ETHEREUM_SEPOLIA_RPC --private-key $ETHEREUM_SEPOLIA_PRIVATE_KEY "request(address)" $CONTRACT_ADDR --value 0.1ether
```

```bash
cast send 0x2afaFD298b23b62760711756088F75B7409f5967 --rpc-url $BASE_SEPOLIA_RPC --private-key $BASE_SEPOLIA_PRIVATE_KEY "request(address)" $CONTRACT_ADDR --value 0.1ether
```

## Lasna Testnet

Network parameters:

* **Network Name:** Reactive Lasna
* **RPC URL:** https://lasna-rpc.rnk.dev/
* **Chain ID:** 5318007
* **Currency Symbol:** lREACT
* **Block Explorer:** https://lasna.reactscan.net

<LasnaButton />
---
title: Reactscan
sidebar_position: 13
description: Learn how to find information on Reactscan with relevant links and pictures.
slug: /reactscan
hide_title: true
---

![Economy](./img/reactscan.jpg)

## Overview 

Reactscan is a tool that provides developers with an overview of the Reactive Network, including addresses, contracts, and transaction details.

[Reactive Scan (Mainnet) →](https://reactscan.net/)

[Lasna Scan (Testnet) →](https://lasna.reactscan.net/)

## My RVM Address

Your contracts and reactive transactions are located in your RVM address section, which should match the deployment address.

[Learn more about ReactVM →](./reactvm.md)

## How to Find Your RVM Address

1. Navigate to the **Latest RVMs** section on the main page.
2. If your address doesn’t appear there, click the **View All RVMs** link to access the complete list of addresses.

![Img 1](./reactscan-img/1.jpg)

3. Alternatively, use the search bar at the top of the page to locate your RVM address by entering it directly into the search field.

4. For direct access, you can open your RVM page by entering the following URL into your browser: **https://reactscan.net/rvm/ADDRESS**. Replace `ADDRESS` with your unique RVM address.

:::info[Good to Know]
Clicking the **[watch]** button on your RVM page moves your RVM address to the top of the list in the **Latest RVMs** section. This feature ensures quick and convenient access to your address directly from the main page. With your address pinned at the top, there's no need to manually search or enter it into the search bar — it will always be available.
:::

![Img 2](./reactscan-img/2.jpg)

![Img 3](./reactscan-img/3.jpg)

## RVM Page for Developers

On your RVM page, you can access a detailed view of the contracts you've deployed and the transactions you've initiated. Additionally, your balance in REACT is displayed for quick reference.

![Img 4](./reactscan-img/4.jpg)

The **Main Transactions** page provides an overview of all transactions, organized into a table with the following columns: **Numb, Hash, Status, Time, Origin, Interacted With, Type,** and **Callbacks.** Here’s a detailed explanation of some key columns:

- **Type**: indicates the nature of the transaction. It can take two values - **DEPLOY** (transaction where a contract was deployed) and **REACT** (a transaction that reacts to an originating transaction).

- **Callbacks**: If a transaction generates callbacks, this column displays the exact number of callbacks triggered. For transactions with no callbacks, it simply shows **N/A**. You can click the transaction hash to open its details and view all associated callbacks.

- **Interacted With**: the contract initiating the transaction.

![Img 5](./reactscan-img/5.jpg)

### Contract

The **Contract** page provides a detailed view of all transactions related to a specific contract. Contract subscriptions can be viewed on this page, too.

:::info[Good to Know]
Your REACT balance is also visible on your RVM page for easy reference.
:::

The page displays the current **contract status**, either `Active` or `Inactive`. If your contract is inactive, you can follow the instructions on the [Debt Coverage](./economy.md#direct-transfers) page to activate it.

![Img 6](./reactscan-img/6.jpg)

Similar to the **Main Transactions** page in your RVM, the contract page features a transaction table with the same columns: **Numb, Hash, Status, Time, Origin, Interacted With, Type,** and **Callbacks.** Here’s a breakdown of key columns:

- **Type**: indicates the nature of the transaction. It can take two values - **DEPLOY** (transaction where a contract was deployed) and **REACT** (a transaction that reacts to an originating transaction).

- **Callbacks**: If a transaction generates callbacks, this column displays the exact number of callbacks triggered. For transactions with no callbacks, it simply shows **N/A**. You can click the transaction hash to open its details and view all associated callbacks.

- **Interacted With**: the contract initiating the transaction.

### Subscriptions

Next to the transactions section, you can view the **subscriptions** associated with the contract. The subscription details include the following fields:

- **Subscription Status**: **Active** (the subscription is actively monitoring events on the origin chain) or **Inactive** (the subscription has stopped monitoring events).

- **Chain**: Specifies the origin chain where the subscription is monitoring events.

- **Criteria**: **Origin Contract**, **topic_0**, **topic_1**, **topic_2**, and **topic_3**.

![Img 7](./reactscan-img/7.jpg)

[Learn more about Subscriptions →](./subscriptions.md)

## RVM Transaction

Each RVM displays a list of clickable, numbered transactions, with the most recent appearing at the top. Clicking on a transaction number or hash reveals detailed information.

![Img 8](./reactscan-img/8.jpg)

At the top left, the **RVM address** is shown and can be copied. Below that, you’ll find the **contract status** and **timestamp**.

![Img 9](./reactscan-img/9.jpg)

The **Transaction Overview** section includes:

* **Interacted With**: The contract address involved in the transaction.
* **Transaction Hash, Transaction Type, and Status**: Self-explanatory.
* **From**: The EOA associated with the RVM address.

![Img 10](./reactscan-img/10.jpg)

Next, the **Gas Overview** displays gas consumption details.

If the transaction involves cross-chain activity (beyond contract deployment), two additional sections appear:

* **Destination Transaction:** Includes a clickable hash linking to the relevant chain.
* **Origin Transaction:** Shows the corresponding hash from the originating chain.

![Img 11](./reactscan-img/11.jpg)

The **Origin Transaction Payload** contains: Origin Contract, Topic 0, Topic 1, Topic 2, Topic 3, Data, Block Number, OpCode.

![Img 12](./reactscan-img/12.jpg)

Additionally, there may be log entries:

* **Log 1**: Event Signature Hash, Address, Topic 1, Topic 2, Topic 3, Log Data
* **Log 2**: Event Signature Hash, Callback Address, Chain ID, Contract, Gas Limit, Payload

![Img 13](./reactscan-img/13.jpg)

## RNK Transactions

On the main page of Reactive Scan, the **\[Latest RNK Transactions\]** section is located at the bottom right. This section displays four key columns: transaction hash, transaction status, initiating contract, block timestamp.

![Img 14](./reactscan-img/14.jpg)

Below this section, you'll find the **\[View All Transactions \>\>\]** button. Clicking it opens a real-time list of recent transactions, providing detailed information such as the transaction hash, status, timestamp, from (sender), and to (recipient).

![Img 15](./reactscan-img/15.jpg)

To explore a specific transaction, either click on its hash in the list or add the transaction hash directly to the URL, like so: \`tx/0xea20f5cd4b2c01b549f58c2f109129987e95fc15560d56cab62f76262c571454\`. This will bring you to a detailed transaction view.

At the top left, the **transaction hash** is shown and can be copied. Below that, you’ll find the **transaction status**, **Transaction Type** (\`Legacy 0\`, \`AccessList 1\`, \`DynamicFee 2\`, \`Blob 3\`, and \`SetCode 4\`), and **Block Timestamp.**

![Img 16](./reactscan-img/16.jpg)

The **Transaction Overview** section includes:

- **Interacted With**: The contract initiating the transaction.
- **Transaction Hash**, **Block Number**, **From (sender)** – Self-explanatory.
- **Value**: The amount transferred (if any).

![Img 17](./reactscan-img/17.jpg)

Next, the **Gas Overview** displays gas consumption details.

- **Gas Used**: The amount of gas consumed by the transaction.
- **Gas Price**: The price paid per unit of gas.

![Img 18](./reactscan-img/18.jpg)

If applicable, **logs** associated with the transaction may be displayed, containing: Event Signature Hash, Address, Topic 1, and Log Data. Logs may appear in two groups (Logs 1 and Logs 2\) if multiple events are triggered during the transaction.

![Img 19](./reactscan-img/19.jpg)
---
title: ReactVM
sidebar_position: 5
description: Learn about ReactVM, the execution environment where Reactive Contracts process event logs and execute event-driven automation across chains.
slug: /reactvm
hide_title: true
---

![ReactVM Image](./img/rvm.jpg)

## Overview

ReactVM is a private execution environment within Reactive Network where [Reactive Contracts](./reactive-contracts) process events and execute logic. Each Reactive Contract runs inside a dedicated ReactVM that activates when subscribed events occur. Event logs are delivered to the ReactVM, where the contract executes Solidity logic and determines whether callback transactions should be sent to destination chains. ReactVMs run independently and can execute in parallel, allowing Reactive Contracts to process events while maintaining deterministic execution within each ReactVM.

## My ReactVM

Each deployed Reactive Contract is assigned to a ReactVM derived from the deployer’s address. Contracts deployed from the same EOA share the same ReactVM and can interact through shared state. Although multiple Reactive Contracts can be deployed within one ReactVM, separating contracts across ReactVMs is generally recommended.

### Calling subscribe()

Calling `subscribe()` or `unsubscribe()` inside ReactVM has no effect. Subscriptions must be managed through the Reactive Network instance of the contract. ReactVM contracts should communicate through callback transactions instead of direct subscription calls.

## State

Each ReactVM maintains its own state based on processed events. ReactVM blocks include references to origin-chain block numbers and hashes, allowing Reactive Network to track and handle chain reorganizations. ReactVM states operate independently, and the overall Reactive Network state is the combination of all ReactVM states.

### Dual-State Environment

Each Reactive Contract exists in two environments with separate state:

- **ReactVM State** — updated automatically when subscribed events occur
- **Reactive Network State** — updated when EOAs call contract functions

Both instances share the same bytecode but operate independently.

For example, in a governance contract:

- Vote counts may be maintained in ReactVM state
- Administrative actions such as `pause()` may exist in the Reactive Network state

Most automation logic runs inside ReactVM.

## Reactive Network Processing Flow

The diagram below shows how events from an origin chain are processed by Reactive Network and ReactVM, and how resulting actions are delivered to destination chains.

![Reactive Network Lifecycle](./img/global-processing-flow.png)

[More on ReactVM →](../education/module-1/react-vm.md)
---
title: RNK RPC Methods
sidebar_position: 11
description: Learn about Reactive Network's Geth version RPC methods used for interaction with Reactive nodes and ReactVMs.
slug: /rnk-rpc-methods
hide_title: true
---

![RNK RPC Methods](./img/rnk-rpc-methods.jpg)

## Overview

This page documents **Reactive-specific JSON-RPC methods** available in Reactive Network’s (RNK) Geth version. Use them to inspect **ReactVM activity** (transactions, logs, code, storage), and to query network metadata like subscribers, filters, and origin-chain stats.

:::tip[Ethereum RPC Methods]
Reactive Network supports standard [Geth RPC methods](https://geth.ethereum.org/docs/interacting-with-geth/rpc). This page lists RNK extensions only.
:::

## rnk_getTransactionByHash

Returns a ReactVM transaction by RVM ID and transaction hash.

#### Parameters

1. **rvmId**: `DATA`, 20 Bytes — The ReactVM ID associated with the transaction.
2. **txHash**: `DATA`, 32 Bytes — The hash of the transaction to retrieve.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getTransactionByHash",
  "params": [
    "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
    "0xe32b9f60321f7a83ef9dda5daf8cf5b2f5cd523156ee484f417d62d84d1e3044"
  ],
  "id": 1
}' | jq
```

#### Response

Returns an object with the following fields:

- **hash** (`string`): The transaction hash.
- **number** (`string`): The transaction number (hex-encoded).
- **time** (`uint64`): The timestamp of when the transaction occurred.
- **root** (`string`): The Merkle root associated with the transaction.
- **limit** (`uint32`): The maximum gas limit set for the transaction.
- **used** (`uint32`): The gas used by the transaction.
- **type** (`uint8`): The transaction type (0 for `Legacy`, 1 for `AccessList`, 2 for `DynamicFee`, 3 for `Blob`, 4 for `SetCode`).
- **status** (`uint8`): The status of the transaction (1 for `Success`, 0 for `Failure`).
- **from** (`string`): The transaction initiator.
- **to** (`string`): The recipient address.
- **createContract** (`bool`): Indicates whether a contract was created during this transaction.
- **sessionId** (`uint64`): The block number where the transaction is located (hex-encoded).
- **refChainId** (`uint32`): The origin chain ID.
- **refTx** (`string`): The hash of the origin chain transaction that triggered this one.
- **refEventIndex** (`uint32`): The origin chain event opcode (0 for `LOG0`, 1 for `LOG1`, 2 for `LOG2`, 3 for `LOG3`, 4 for `LOG4`).
- **data** (`string`): The encoded transaction data in hexadecimal format.
- **rData** (`string`): Additional response data in hexadecimal format (if any).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "hash": "0xe32b9f60321f7a83ef9dda5daf8cf5b2f5cd523156ee484f417d62d84d1e3044",
    "number": "0x9",
    "time": 1753427529,
    "root": "0x8df166bb5c9843696457dbdc5ab20ca1ab9acdd8703b6f1fd1f51766f34fad7d",
    "limit": 900000,
    "used": 47429,
    "type": 2,
    "status": 1,
    "from": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
    "to": "0x6ba34385d9018cfa3341db62b68b5a55839fe71f",
    "createContract": false,
    "sessionId": 109252,
    "refChainId": 11155111,
    "refTx": "0x52daf0ff44c50da56024f02530ba70fcf653ad11dadb1788b24b20fc824520f5",
    "refEventIndex": 328,
    "data": "0x0d152c2c00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000aa36a7000000000000000000000000c156ad2846d093e0ce4d31cf6d780357e9675dce8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925000000000000000000000000a7d9aa89cbcd216900a04cdc13eb5789d643176a00000000000000000000000065a9b8b03a2ef50356104cb594ba2c91223973de00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000086da6000000000000000000000000000000000000000000000000000000000000000034570ac2a3bbfa2809982e69218a745aa83e1bff79b54e2a2ce10e5d6d4c5c00a52daf0ff44c50da56024f02530ba70fcf653ad11dadb1788b24b20fc824520f50000000000000000000000000000000000000000000000000000000000000148000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000003e8",
    "rData": "0x"
  }
}
```

## rnk_getTransactionByNumber

Returns a ReactVM transaction by RVM ID and transaction number.

#### Parameters

1. **rvmId**: `DATA`, 20 Bytes — The ReactVM ID associated with the transaction.
2. **txNumber**: `HEX` — The sequence number of the transaction to retrieve.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getTransactionByNumber",
  "params": [
    "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
    "0x9"
  ],
  "id": 1
}' | jq
```

#### Response

Returns an object with the following fields:

- **hash** (`string`): The transaction hash.
- **number** (`string`): The transaction number (hex-encoded).
- **time** (`uint64`): The timestamp of when the transaction occurred.
- **root** (`string`): The Merkle root associated with the transaction.
- **limit** (`uint32`): The maximum gas limit set for the transaction.
- **used** (`uint32`): The gas used by the transaction.
- **type** (`uint8`): The transaction type (0 for `Legacy`, 1 for `AccessList`, 2 for `DynamicFee`, 3 for `Blob`, 4 for `SetCode`).
- **status** (`uint8`): The status of the transaction (1 for `Success`, 0 for `Failure`).
- **from** (`string`): The transaction initiator.
- **to** (`string`): The recipient address.
- **createContract** (`bool`): Indicates whether a contract was created during this transaction.
- **sessionId** (`uint64`): The block number where the transaction is located (hex-encoded).
- **refChainId** (`uint32`): The origin chain ID.
- **refTx** (`string`): The hash of the origin chain transaction that triggered this one.
- **refEventIndex** (`uint32`): The origin chain event opcode (0 for `LOG0`, 1 for `LOG1`, 2 for `LOG2`, 3 for `LOG3`, 4 for `LOG4`).
- **data** (`string`): The encoded transaction data in hexadecimal format.
- **rData** (`string`): Additional response data in hexadecimal format (if any).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "hash": "0xe32b9f60321f7a83ef9dda5daf8cf5b2f5cd523156ee484f417d62d84d1e3044",
    "number": "0x9",
    "time": 1753427529,
    "root": "0x8df166bb5c9843696457dbdc5ab20ca1ab9acdd8703b6f1fd1f51766f34fad7d",
    "limit": 900000,
    "used": 47429,
    "type": 2,
    "status": 1,
    "from": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
    "to": "0x6ba34385d9018cfa3341db62b68b5a55839fe71f",
    "createContract": false,
    "sessionId": 109252,
    "refChainId": 11155111,
    "refTx": "0x52daf0ff44c50da56024f02530ba70fcf653ad11dadb1788b24b20fc824520f5",
    "refEventIndex": 328,
    "data": "0x0d152c2c00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000aa36a7000000000000000000000000c156ad2846d093e0ce4d31cf6d780357e9675dce8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925000000000000000000000000a7d9aa89cbcd216900a04cdc13eb5789d643176a00000000000000000000000065a9b8b03a2ef50356104cb594ba2c91223973de00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000086da6000000000000000000000000000000000000000000000000000000000000000034570ac2a3bbfa2809982e69218a745aa83e1bff79b54e2a2ce10e5d6d4c5c00a52daf0ff44c50da56024f02530ba70fcf653ad11dadb1788b24b20fc824520f50000000000000000000000000000000000000000000000000000000000000148000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000003e8",
    "rData": "0x"
  }
}
```

## rnk_getTransactionLogs

Returns the logs emitted by a ReactVM transaction number.

#### Parameters

1. **rvmId**: `DATA`, 20 Bytes — The ReactVM ID for which transaction logs are being queried.
2. **txNumber**: `HEX` — The transaction number for which logs are requested.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getTransactionLogs",
  "params": [
    "0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a",
    "0x9"
  ],
  "id": 1
}' | jq
```

#### Response

Returns an array of objects with the following fields:

- **txHash** (`string`): The transaction hash.
- **address** (`string`): The contract address that generated the transaction.
- **topics** (`string[]`): An array of indexed event topics.
   - **topics[0]**: The event signature hash.
   - **topics[1]**: The first indexed parameter (if applicable).
   - **topics[2]**: The second indexed parameter (if applicable).
   - **topics[3]**: The third indexed parameter (if applicable).
- **data** (`string`): The non-indexed event data in hexadecimal format.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "txHash": "0xe32b9f60321f7a83ef9dda5daf8cf5b2f5cd523156ee484f417d62d84d1e3044",
      "address": "0x6ba34385d9018cfa3341db62b68b5a55839fe71f",
      "topics": [
        "0x8dd725fa9d6cd150017ab9e60318d40616439424e2fade9c1c58854950917dfc",
        "0x0000000000000000000000000000000000000000000000000000000000aa36a7",
        "0x000000000000000000000000fc2236a0d3421473676c4c422046fbc4f1afdffe",
        "0x00000000000000000000000000000000000000000000000000000000000f4240"
      ],
      "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a42f90252d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065a9b8b03a2ef50356104cb594ba2c91223973de000000000000000000000000a7d9aa89cbcd216900a04cdc13eb5789d643176a000000000000000000000000c156ad2846d093e0ce4d31cf6d780357e9675dce00000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000"
    }
  ]
}
```

## rnk_getHeadNumber

Returns the latest transaction number for a given ReactVM.

#### Parameters

1. **rvmId**: `DATA`, 20 Bytes — The ReactVM ID for which the latest transaction number is requested.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getHeadNumber",
  "params": [
    "0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a"
  ],
  "id": 1
}' | jq
```

#### Response

Returns an object with the following field:

- **result** (`string`): the latest transaction number (hex-encoded).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x9"
}
```

## rnk_getTransactions

Returns a range of transactions from a given starting number.

#### Parameters

1. **rvmId**: `DATA`, 20 Bytes — The ReactVM ID for which transactions are being retrieved.
2. **from**: `HEX` — The starting transaction number.
3. **limit**: `HEX` — The maximum number of transactions to retrieve.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getTransactions",
  "params": [
    "0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a",
    "0x9",
    "0x1"
  ],
  "id": 1
}' | jq
```

#### Response

Returns an object with the following fields:

- **hash** (`string`): The transaction hash.
- **number** (`string`): The transaction number (hex-encoded).
- **time** (`uint64`): The timestamp of when the transaction occurred.
- **root** (`string`): The Merkle root associated with the transaction.
- **limit** (`uint32`): The maximum gas limit set for the transaction.
- **used** (`uint32`): The gas used by the transaction.
- **type** (`uint8`): The transaction type (0 for `Legacy`, 1 for `AccessList`, 2 for `DynamicFee`, 3 for `Blob`, 4 for `SetCode`).
- **status** (`uint8`): The status of the transaction (1 for `Success`, 0 for `Failure`).
- **from** (`string`): The transaction initiator.
- **to** (`string`): The recipient address.
- **createContract** (`bool`): Indicates whether a contract was created during this transaction.
- **sessionId** (`uint64`): The block number where the transaction is located (hex-encoded).
- **refChainId** (`uint32`): The origin chain ID.
- **refTx** (`string`): The hash of the origin chain transaction that triggered this one.
- **refEventIndex** (`uint32`): The origin chain event opcode (0 for `LOG0`, 1 for `LOG1`, 2 for `LOG2`, 3 for `LOG3`, 4 for `LOG4`).
- **data** (`string`): The encoded transaction data in hexadecimal format.
- **rData** (`string`): Additional response data in hexadecimal format (if any).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "hash": "0xe32b9f60321f7a83ef9dda5daf8cf5b2f5cd523156ee484f417d62d84d1e3044",
      "number": "0x9",
      "time": 1753427529,
      "root": "0x8df166bb5c9843696457dbdc5ab20ca1ab9acdd8703b6f1fd1f51766f34fad7d",
      "limit": 900000,
      "used": 47429,
      "type": 2,
      "status": 1,
      "from": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
      "to": "0x6ba34385d9018cfa3341db62b68b5a55839fe71f",
      "createContract": false,
      "sessionId": 109252,
      "refChainId": 11155111,
      "refTx": "0x52daf0ff44c50da56024f02530ba70fcf653ad11dadb1788b24b20fc824520f5",
      "refEventIndex": 328,
      "data": "0x0d152c2c00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000aa36a7000000000000000000000000c156ad2846d093e0ce4d31cf6d780357e9675dce8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925000000000000000000000000a7d9aa89cbcd216900a04cdc13eb5789d643176a00000000000000000000000065a9b8b03a2ef50356104cb594ba2c91223973de00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000086da6000000000000000000000000000000000000000000000000000000000000000034570ac2a3bbfa2809982e69218a745aa83e1bff79b54e2a2ce10e5d6d4c5c00a52daf0ff44c50da56024f02530ba70fcf653ad11dadb1788b24b20fc824520f50000000000000000000000000000000000000000000000000000000000000148000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000003e8",
      "rData": "0x"
    }
  ]
}
```

## rnk_getRnkAddressMapping

Returns the ReactVM ID associated with a Reactive Network contract address.

#### Parameters

1. **reactNetworkContrAddr**: `DATA`, 20 Bytes — The address of the Reactive Network contract for which the RVM ID is being requested.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getRnkAddressMapping",
  "params": [
    "0xc3e185561D2a8b04F0Fcd104A562f460D6cC503c"
  ],
  "id": 1
}' | jq
```

#### Response

Returns an object with the following field:

- **rvmId** (`string`): The unique identifier of the RVM associated with the given contract.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "rvmId": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a"
  }
}
```

## rnk_getStat

Returns aggregated statistics per origin chain.

#### Parameters

This method does not require any input parameters.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getStat",
  "params": [],
  "id": 1
}' | jq
```

#### Response

Returns an object with the following fields:

- **chainId** (`object`): The statistics for a specific origin chain.
  - **txCount** (`uint64`): The total number of transactions processed from this origin chain.
  - **eventCount** (`uint64`): The total number of events emitted from this origin chain.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "origin": {
      "11155111": {
        "txCount": 20807136,
        "eventCount": 60122691
      },
      "43113": {
        "txCount": 1244787,
        "eventCount": 4929280
      },
      "5318007": {
        "txCount": 160035,
        "eventCount": 169908
      },
      "80002": {
        "txCount": 450072,
        "eventCount": 1786648
      },
      "84532": {
        "txCount": 14266438,
        "eventCount": 122218657
      },
      "97": {
        "txCount": 3787433,
        "eventCount": 9384761
      }
    }
  }
}
```

## rnk_getVms

Returns information about all known ReactVMs.

#### Parameters

This method does not require any input parameters.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getVms",
  "params": [],
  "id": 1
}' | jq
```

#### Response

Returns a list of active RVMs with the following fields:

- **rvmId** (`string`): The unique identifier of the RVM.
- **lastTxNumber** (`string`): The last transaction number executed by this RVM (hex-encoded).
- **contracts** (`uint32`): The number of contracts associated with this RVM.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "rvmId": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
      "lastTxNumber": "0x9",
      "contracts": 4
    },
    {
      "rvmId": "0xfe5a45db052489cbc16d882404bcfa4f6223a55e",
      "lastTxNumber": "0x2",
      "contracts": 1
    },
    {
      "rvmId": "0x49abe186a9b24f73e34ccae3d179299440c352ac",
      "lastTxNumber": "0x2d6",
      "contracts": 1
    },
    {
      "rvmId": "0x941b727ad8acf020558ce58cd7cb65b48b958db1",
      "lastTxNumber": "0x7",
      "contracts": 3
    },
    {
      "rvmId": "0xc1d48a9173212567bd358e40c50bfe131a9fabf1",
      "lastTxNumber": "0x3c",
      "contracts": 28
    }
  ]
}
```

## rnk_getVm

Returns information about a specific ReactVM.

#### Parameters

1. **rvmId**: `DATA`, 20 Bytes — The unique identifier of the RVM for which information is requested.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getVm",
  "params": ["0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a"],
  "id": 1
}' | jq
```

#### Response

Returns an object with the following fields:

- **rvmId** (`string`): The unique identifier of the RVM.
- **lastTxNumber** (`string`): The last transaction number executed by this RVM (hex-encoded).
- **contracts** (`uint32`): The number of contracts created by this RVM.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "rvmId": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
    "lastTxNumber": "0x9",
    "contracts": 4
  }
}
```

## rnk_getSubscribers

Returns subscriptions associated with a given ReactVM.

#### Parameters

1. **rvmId**: `DATA`, 20 Bytes — The unique identifier of the RVM for which subscriber information is requested.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getSubscribers",
  "params": ["0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a"],
  "id": 1
}' | jq
```

#### Response

Returns a list of RVM-related contract events with the following fields:

- **uid** (`string`): The unique identifier of the subscription.
- **chainId** (`uint32`): The blockchain ID of the subscribed contract.
- **contract** (`string`): The address of the subscribed contract on the origin chain.
- **topics** (`array`): An array of event topics (some may be `null` if not indexed).
- **rvmId** (`string`): The unique identifier of the RVM.
- **rvmContract** (`string`): The address of the RVM contract handling this subscription.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "uid": "7d45d863e45da3a7e60d2cc5bdd7088f",
      "chainId": 11155111,
      "contract": "0xe1bac3039ea58fee2abce7a8cbcc4b0c8ad030c5",
      "topics": [
        "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
        null,
        null,
        null
      ],
      "rvmId": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
      "rvmContract": "0xc3e185561d2a8b04f0fcd104a562f460d6cc503c"
    },
    {
      "uid": "d979ded638e32915f59ae9bfb3b70e6c",
      "chainId": 11155111,
      "contract": "0x7acbd40c79da73b671d47618135486eef39ec6e3",
      "topics": [
        "0x9996f0dd09556ca972123b22cf9f75c3765bc699a1336a85286c7cb8b9889c6b",
        null,
        null,
        null
      ],
      "rvmId": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
      "rvmContract": "0xc3e185561d2a8b04f0fcd104a562f460d6cc503c"
    },
    {
      "uid": "62968b91e4122e0c03a08f38b31a1ae4",
      "chainId": 11155111,
      "contract": "0x16102fe2caa2610a99beaa5f4fb6e230825b1096",
      "topics": [
        "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
        null,
        null,
        null
      ],
      "rvmId": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
      "rvmContract": "0x2afafd298b23b62760711756088f75b7409f5967"
    }
  ]
}
```

## rnk_getCode

Retrieves the deployed contract bytecode for a given ReactVM at a specific state.

#### Parameters

1. **rvmId**: `DATA`, 20 bytes — The unique identifier of the RVM.
2. **contract** `DATA`, 20 bytes — The Reactive contract address.
3. **txNumberOrHash** `HEX | TAG` — Specifies the state at which the contract code is retrieved. Accepts either a block number (`HEX`) or a tag (`"latest"`, `"earliest"`, `"pending"`).

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getCode",
  "params": [
    "0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a",
    "0xA79933a054c8Ad29ae55bEe769Cd9d8228F03520",
    "0x22"
    ],
  "id": 1
}' | jq
```

#### Response

Returns the bytecode of a contract:

- **bytecode** (`string`) — The contract bytecode in hexadecimal format. 

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x60806040526004361061007e575f3560e01c80638456cb591161004d5780638456cb591461010757806396f90b451461011d578063995e4b9814610147578063c290d6911461017157610085565b806303ac52b314610089578063046f7da2146100b3578063...efb147864736f6c634300081c0033",
  
}
```

## rnk_getStorageAt

Returns the value stored at a given 32-byte storage key for a contract inside a specific ReactVM, evaluated at a chosen state.

#### Parameters

1. **rvmId**: `DATA`, 20 bytes — The unique identifier of the RVM.
2. **address**: `DATA`, 20 bytes — The address of the contract from which to retrieve the storage value.
3. **hexKey**: `DATA`, 32 bytes — The hexadecimal key for which the storage value is being queried.
4. **txNumberOrHash**: `HEX | TAG` — Specifies the block number or hash at which the storage value is queried. Accepts either a block number (`HEX`) or a tag (`"latest"`, `"earliest"`, `"pending"`).

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getStorageAt",
  "params": [
    "0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a",
    "0xA79933a054c8Ad29ae55bEe769Cd9d8228F03520",
    "0x0000000000000000000000000000000000000000000000000000000000000002",
    "0xb707d1ddcea3fce0a966fde10f412b4c9cdedf99c67a470a7bbcb2407e1c8bcc"
  ],
  "id": 1
}' | jq
```

#### Response

Returns the storage value:

**result** (`string`): A hexadecimal string representing the storage data.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x000000000000000000000000a7d9aa89cbcd216900a04cdc13eb5789d643176a"
}
```

## rnk_call

Runs a read-only EVM call against a contract inside a ReactVM at a chosen state (no transaction is created).

#### Parameters

1. **rvmId**: `DATA`, 20 bytes — The unique identifier of the RVM.
2. **args**: `OBJECT` — The transaction arguments, including the contract method and parameters. Should include:
    - `to`: `DATA`, 20 bytes — The address of the contract.
    - `data`: `DATA` — The call data, representing the method and parameters.
    - `from`: `DATA`, 20 bytes, (optional) — The address from which the call is simulated. If omitted, the simulation assumes the call is made from an empty address (0x000...).
    - `gas`: `HEX`, (optional) — The maximum amount of gas allowed for the simulation. If omitted, a default value is used.
    - `gasPrice`: `HEX`, (optional) — The price of gas (in RVM-specific units) for the simulation. 
    - `value`: `HEX`, (optional) — The amount of tokens (e.g., Ether) to send along with the call. For non-payable functions, this should be 0.
3. **txNumberOrHash**: `HEX | TAG` — Specifies the block number or hash to use for simulating the call. Accepts either a block number (`HEX`) or a tag (`"latest"`, `"earliest"`, `"pending"`).

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_call",
  "params": [
    "0xA7D9AA89cbcd216900a04Cdc13eB5789D643176a",
    {
      "to": "0xA79933a054c8Ad29ae55bEe769Cd9d8228F03520",
      "data": "0x96f90b45"
    },
    "latest"
  ],
  "id": 1
}' | jq
```

#### Response

Returns the result of the simulated call:

**result** (`string`): The simulated result of the contract call, returned as a hexadecimal string.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x0000000000000000000000000000000000000000000000000000000000027a94"
}
```

## rnk_getBlockRvms

Returns the ReactVMs that produced at least one ReactVM transaction in a given Reactive Network block, plus per-RVM counters.

#### Parameters

1. **blockN**: `uint64` – The block number for which to retrieve the RVM history.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getBlockRvms",
  "params": [
    109252
  ],
  "id": 1
}' | jq
```

#### Response

Returns an array of objects representing RVMs that were active in the given block. Each object contains:

- **rvmId** (`string`): The unique identifier of each RVM.
- **headTxNumber** (`string`): The transaction with the greatest number in the session (hex-encoded).
- **prevRnkBlockId** (`uint64`): The previous block number in which the RVM session was active.
- **txCount** (`uint32`): The total number of transactions in the current RVM session.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "rvmId": "0xa7d9aa89cbcd216900a04cdc13eb5789d643176a",
      "headTxNumber": "0x9",
      "prevRnkBlockId": 109244,
      "txCount": 1
    }
  ]
}
```

## rnk_getFilters

Lists all active log filters (subscriptions) currently registered on Reactive Network.

#### Parameters

This method does not require any input parameters.

#### cURL

```bash
curl --location 'https://lasna-rpc.rnk.dev/' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "method": "rnk_getFilters",
  "params": [],
  "id": 1
}' | jq
```

#### Response

Returns an array of filter objects. Each filter object contains the following fields:

- **uid** (`string`): The unique identifier for the filter.
- **chainId** (`uint32`): The chain ID on which the filter is active.
- **contract** (`string`): The address of the contract the filter is listening to.
- **topics** (`array[string | null]`): An array of up to 4 log topics (from `topic_0` to `topic_3`) used for event filtering. Unused topics are null.
- **configs** (`array[object]`): An array of configuration objects for reactive contracts and their associated ReactVMs.
- **contract** (`string`): The reactive contract address.
- **rvmId** (`string`): The ReactVM ID where the reactive contract resides.
- **active** (`bool`): Indicates whether the subscription/filter is active.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "Uid": "4603da7efc5d1b77f7fa5b0bfd949d6c",
      "ChainId": 11155111,
      "Contract": "0x1e8db093a0cc38302f5822a451809bfd692ff695",
      "Topics": [
        "0x8cabf31d2b1b11ba52dbb302817a3c9c83e4b2a5194d35121ab1354d69f6a4cb",
        null,
        null,
        null
      ],
      "Configs": [
        {
          "Contract": "0xac9163487ca9c5189766706595cbef9b75c1c8e9",
          "RvmId": "0xc1d48a9173212567bd358e40c50bfe131a9fabf1",
          "Active": true
        }
      ]
    },
    {
      "Uid": "b91cf2f05464d578896164d4e6c0c854",
      "ChainId": 11155111,
      "Contract": "0x5e3eeda090eea783af9ee8d81147d9417bb97b38",
      "Topics": [
        "0x8cabf31d2b1b11ba52dbb302817a3c9c83e4b2a5194d35121ab1354d69f6a4cb",
        null,
        null,
        null
      ],
      "Configs": [
        {
          "Contract": "0xe3cf3d848557974d3abf8e7c15c3a534187f1c6f",
          "RvmId": "0xc1d48a9173212567bd358e40c50bfe131a9fabf1",
          "Active": true
        }
      ]
    },
    {
      "Uid": "0fce746e0305e2fc2e425735ea71a52f",
      "ChainId": 11155111,
      "Contract": "0x0102e0a1792b8805f16b6ec27978f6898b865475",
      "Topics": [
        "0x9bffe4738606691ddfa5e5d28208b6ef74537676b39ddb9854b7854a62df0692",
        null,
        null,
        null
      ],
      "Configs": [
        {
          "Contract": "0xe4d4b0c2f8502a98e68c6f0ef2483214c106fd82",
          "RvmId": "0x941b727ad8acf020558ce58cd7cb65b48b958db1",
          "Active": true
        }
      ]
    }
  ]
}
```
---
title: Subscriptions
sidebar_position: 10
description: Learn how Reactive Contracts subscribe to events and configure event-driven automation.
slug: /subscriptions
hide_title: true
---

![Subscriptions Image](./img/subscriptions.jpg)

## Overview

Subscriptions define which events Reactive Contracts (RCs) listens to. RCs subscribe to events through the system contract by specifying:

- Origin chain ID
- Contract address
- Event topics

When a matching event is detected, the contract's `react()` function is triggered.

Subscriptions can be configured:

- During deployment (constructor)
- Dynamically via callbacks

## Subscription Basics

Subscriptions are created by calling `subscribe()` on the system contract. This is typically done inside the contract constructor. Since contracts deploy both on Reactive Network (RNK) and inside a ReactVM (where the system contract doesn't exist), the constructor must avoid calling `subscribe()` inside ReactVM.

[IReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IReactive.sol), [AbstractReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/abstract-base/AbstractReactive.sol), and [ISystemContract](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/ISystemContract.sol) should be implemented. Here's a subscription example in the constructor from the [Basic Demo Reactive Contract](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/basic/BasicDemoReactiveContract.sol):

```solidity
uint256 public originChainId;
uint256 public destinationChainId;
uint64 private constant GAS_LIMIT = 1000000;

address private callback;

constructor(
    address _service,
    uint256 _originChainId,
    uint256 _destinationChainId,
    address _contract,
    uint256 _topic_0,
    address _callback
) payable {
    service = ISystemContract(payable(_service));
    
    originChainId = _originChainId;
    destinationChainId = _destinationChainId;
    callback = _callback;

    if (!vm) {
        service.subscribe(
            originChainId,
            _contract,
            _topic_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }
}
```

Subscriptions filter events using:

- Chain ID
- Contract address
- Topics 0–3

:::info[Filtering Criteria]
Reactive Network provides filtering criteria based on the origin contract's chain ID, address, and all four topics.
:::

## Wildcards & Matching

### REACTIVE_IGNORE

`REACTIVE_IGNORE` is a predefined wildcard value that matches any topic value:

```json
0xa65f96fc951c35ead38878e0f0b7a3c744a6f5ccc1476b313353ce31712313ad
```

### Zero Values

Wildcards can also be specified with:

- `uint256(0)` → any chain ID
- `address(0)` → any contract

**At least one parameter must be specific.**

### Subscription Examples

#### All Events From One Contract

```solidity
service.subscribe(
    CHAIN_ID,
    0x7E0987E5b3a30e3f2828572Bb659A548460a3003,
    REACTIVE_IGNORE,
    REACTIVE_IGNORE,
    REACTIVE_IGNORE,
    REACTIVE_IGNORE
);
```

#### Specific Event Type

Example: Uniswap V2 Sync events

```solidity
service.subscribe(
    CHAIN_ID,
    address(0),
    0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1,
    REACTIVE_IGNORE,
    REACTIVE_IGNORE,
    REACTIVE_IGNORE
);
```

#### Specific Contract and Event

```solidity
service.subscribe(
    CHAIN_ID,
    0x7E0987E5b3a30e3f2828572Bb659A548460a3003,
    0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1,
    REACTIVE_IGNORE,
    REACTIVE_IGNORE,
    REACTIVE_IGNORE
);
```

#### Multiple Subscriptions

Call `subscribe()` multiple times:

```solidity
if (!vm) {

    service.subscribe(
        originChainId,
        _contract1,
        _topic0,
        REACTIVE_IGNORE,
        REACTIVE_IGNORE,
        REACTIVE_IGNORE
    );

    service.subscribe(
        originChainId,
        _contract2,
        REACTIVE_IGNORE,
        _topic1,
        REACTIVE_IGNORE,
        REACTIVE_IGNORE
    );
}
```

### Unsubscribing

Subscriptions can be removed through the system contract.

Export the wildcard constant:

```bash
export REACTIVE_IGNORE=0xa65f96fc951c35ead38878e0f0b7a3c744a6f5ccc1476b313353ce31712313ad
```

Example:

```bash
cast send \
  --rpc-url $REACTIVE_RPC \
  --private-key $REACTIVE_PRIVATE_KEY \
  $SYSTEM_CONTRACT_ADDR \
  "unsubscribeContract(address,uint256,address,uint256,uint256,uint256,uint256)" \
  $REACTIVE_CONTRACT_ADDR \
  $ORIGIN_CHAIN_ID \
  $ORIGIN_CONTRACT \
  $TOPIC_0 \
  $REACTIVE_IGNORE \
  $REACTIVE_IGNORE \
  $REACTIVE_IGNORE
```

### Subscription Limitations

#### Equality Matching Only

Subscriptions support exact matches only.

Not supported:

- `<` or `>`
- Ranges
- Bitwise filters

#### Complex Criteria Sets

Each subscription defines **one set of matching criteria**.

Not supported:

- Disjunctions (OR conditions)
- Multiple criteria sets within one subscription

Workaround:

- Use multiple `subscribe()` calls
- May lead to a **large number of subscriptions**

#### No Global Subscriptions

Not allowed:

- All chains
- All contracts
- All events on a chain

#### Duplicate Subscriptions

Duplicate subscriptions are allowed but behave as one subscription.

Each `subscribe()` transaction still costs gas.

## Dynamic Subscriptions

Subscriptions can be created or removed dynamically based on incoming events.

Subscription management is performed through the system contract, which is accessible only from Reactive Network (RNK). The ReactVM instance of a contract can't call the system contract directly, so dynamic subscription changes must be performed through callback transactions.

The typical flow is:

1. An event is received in the ReactVM.
2. The contract decides whether to subscribe or unsubscribe.
3. A `Callback` event is emitted.
4. Reactive Network (RNK) executes the subscription change.

### Subscribing & Unsubscribing

These functions run on the Reactive Network contract instance and modify subscriptions through the system contract. The example below is based on the [ApprovalListener.sol](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/approval-magic/ApprovalListener.sol) contract from the [Approval Magic demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/approval-magic).

```solidity
// Methods specific to Reactive Network contract instance

function subscribe(address rvm_id, address subscriber)
    external
    rnOnly
    callbackOnly(rvm_id)
    {
        service.subscribe(
            SEPOLIA_CHAIN_ID,
            address(0),
            APPROVAL_TOPIC_0,
            REACTIVE_IGNORE,
            uint256(uint160(subscriber)),
            REACTIVE_IGNORE
        );
    }

function unsubscribe(address rvm_id, address subscriber)
    external
    rnOnly
    callbackOnly(rvm_id)
    {
        service.unsubscribe(
            SEPOLIA_CHAIN_ID,
            address(0),
            APPROVAL_TOPIC_0,
            REACTIVE_IGNORE,
            uint256(uint160(subscriber)),
            REACTIVE_IGNORE
        );
    }
```

Parameters:

- **rvm_id** — ReactVM identifier (injected automatically)
- **subscriber** — address to subscribe or unsubscribe

Operations:

- **subscribe** — registers a subscriber for `APPROVAL_TOPIC_0`
- **unsubscribe** — removes a subscriber from `APPROVAL_TOPIC_0`

### react() Logic

The `react()` function processes incoming events and emits callbacks when subscription changes are required.

```solidity
// Methods specific to ReactVM contract instance
function react(LogRecord calldata log) external vmOnly {
        
    if (log.topic_0 == SUBSCRIBE_TOPIC_0) {
            
        bytes memory payload = abi.encodeWithSignature(
            "subscribe(address,address)",
            address(0),
            address(uint160(log.topic_1))
        );
        
        emit Callback(
            REACTIVE_CHAIN_ID, 
            address(this), 
            CALLBACK_GAS_LIMIT, 
            payload
        );
        
    } else if (log.topic_0 == UNSUBSCRIBE_TOPIC_0) {
            
        bytes memory payload = abi.encodeWithSignature(
            "unsubscribe(address,address)",
            address(0),
            address(uint160(log.topic_1))
        );
            
        emit Callback(
            REACTIVE_CHAIN_ID, 
            address(this), 
            CALLBACK_GAS_LIMIT, 
            payload);
        
    } else {
        
        (uint256 amount) = abi.decode(log.data, (uint256));
            
        bytes memory payload = abi.encodeWithSignature(
            "onApproval(address,address,address,address,uint256)",
            address(0),
            address(uint160(log.topic_2)),
            address(uint160(log.topic_1)),
            log._contract,
            amount
        );
        
        emit Callback(
            SEPOLIA_CHAIN_ID, 
            address(approval_service), 
            CALLBACK_GAS_LIMIT, 
            payload
        );
    }
}
```

Event handling:

- **Subscribe event** → emits a callback that creates a subscription
- **Unsubscribe event** → emits a callback that removes a subscription
- **Other events** → emit callbacks that trigger application logic

Callbacks are executed by Reactive Network after the event is processed.

[More on Subscriptions →](../education/module-1/subscriptions.md)

---
sidebar_position: 1
title: Introduction
description: Embark on a journey through Reactive Contracts with our educational program. Dive into lectures, GitHub code, and video demos for a hands-on learning experience.
slug: /education/introduction
hide_title: true
---

![Reactive Network Education Image](../img/reactive-education.jpg)

## Overview

To better understand the concept of Reactive Contracts (RCs), we have developed an educational course featuring detailed lectures, code snippets on [GitHub](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos), and video workshops on [YouTube](https://www.youtube.com/@0xReactive/streams). Our goal is to provide both theoretical knowledge and practical challenges, creating a community where developers can fully explore RCs.

## Where to Begin 

The Introduction chapter provides an overview of Reactive Contracts, highlighting their ability to autonomously react to events on EVM-compatible chains. It also outlines the technical and knowledge prerequisites necessary for mastering these concepts.

[Introduction to Reactive Contracts →](./reactive-contracts.md)

[Prerequisites →](./prerequisites.md)

## Module One

[Module 1](../module-1/index.md) is dedicated to the basics of Reactive Contracts, events and callbacks, the ReactVM and Reactive Network environments, subscriptions, and the function of oracles in integrating off-chain data.

[Reactive Contracts →](../module-1/reactive-contracts.md)

[How Events and Callbacks Work →](../module-1/how-events-work.md)

[ReactVM and Reactive Network →](../module-1/react-vm.md)

[How Subscriptions Work →](../module-1/subscriptions.md)

[How Oracles Work →](../module-1/how-oracles-work.md)

## Module Two

[Module 2](../module-2/index.md) explores Uniswap V2, focusing on liquidity pools and smart contract operations. It also elaborates on the basic functions of Reactive Contracts that enable autonomous execution.

[How Uniswap Works →](../module-2/how-uniswap-works.md)

[Basic Reactive Functions →](../module-2/basic-reactive-functions.md)

## Use Cases

The [Use Cases](../use-cases/index.md) section explains scenarios where Reactive Contracts can improve blockchain apps. It includes a basic demo for low-latency log monitoring and interaction across different chains, a guide on deploying RCs using Remix, and a demonstration of a stop order implementation on a Uniswap V2 liquidity pool.

[Basic Demo →](../use-cases/use-case-1.md)

[Uniswap V2 Stop Order Demo →](../use-cases/use-case-3.md)

[Deploying Reactive Contracts with Remix →](../use-cases/remix-ide-demo.mdx)

## Glossary

The Glossary provides concise definitions of key terms related to blockchain technology, decentralized finance, and smart contracts, including specific Reactive terms to prevent potential confusion.

[Glossary →](../glossary.md)
---
title: Technical and Knowledge Prerequisites for Mastering Reactive Contracts
sidebar_position: 2
description: Learn Reactive Contracts (RCs) with prerequisites like Solidity, EVM basics, Git, and an Ethereum wallet.
slug: prerequisites
---

# Technical and Knowledge Prerequisites for Mastering Reactive Contracts

## Overview 

Before embarking on your journey, it's crucial to have a solid foundation in several key areas. These prerequisites will ensure you can fully grasp the concepts and practical applications of Reactive Contracts (RCs).

## What You Need to Know for This Course

In this course, we aim to equip you with everything you need to grasp the basic use cases of Reactive Contracts, including deploying and interacting with them. While we intend to cover all critical information, a foundational understanding of Ethereum Smart Contracts will greatly improve your learning experience. Below are the prerequisites along with resources to help you get up to speed.

### Solidity and Smart Contract Development

Understanding the syntax and functionalities of Solidity is fundamental. You should be comfortable writing simple smart contracts and familiar with their concepts.

Educational Resource: [Solidity by Example](https://solidity-by-example.org/) is an excellent place to start, offering hands-on examples to guide you through Solidity's basics to more advanced topics.

### Ethereum Virtual Machine (EVM)

A basic understanding of the EVM is crucial as it's the runtime environment for smart contracts. Knowledge about how contracts are executed, how functions operate, and how transactions are signed will be beneficial.

Educational Resource: The [Ethereum EVM illustrated](https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf) guide provides a visual and detailed explanation of the EVM's inner workings.

### Git and Command Line Understanding

Understanding basic Git commands and command line usage is crucial for effectively using the code examples that we will provide. Familiarity with an Integrated Development Environment (IDE) like Visual Studio Code can significantly enhance your coding experience.

Educational Resource: The [Pro Git](https://git-scm.com/book/en/v2) book offers a concise and practical introduction to Git. For command line basics, check out the [Codecademy's Command Line](https://www.codecademy.com/learn/learn-the-command-line) course.

### Ethereum Wallet and Test ETH

To interact with Ethereum networks, including deploying and testing smart contracts, you'll need an Ethereum wallet and some ETH on the Sepolia testnet. This setup is vital for transaction fees (gas) and interacting with deployed contracts.

Getting Sepolia ETH: Visit the [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) to obtain testnet ETH.

## What You Don’t Need to Know Beforehand

We recognize that some topics, while not directly related to Reactive Contracts, are essential for a comprehensive understanding of the blockchain landscape. To ensure you have a well-rounded knowledge base, we've included lessons on these broader blockchain concepts and tools. This means you won’t have to look elsewhere to fill in the gaps.

### Knowledge of EVM Events

EVM events are a cornerstone for RCs, serving as triggers for reactive functionalities. An understanding of how events work, how they're logged, and how to interact with them is crucial.

Educational Resource: Learn about [EVM events](../module-1/how-events-work.md) in detail.

### Decentralized Finance Concepts

Familiarity with DeFi concepts, such as liquidity pools, yield farming, and automated market makers (AMMs), will be helpful, especially for understanding real-world applications of RCs.

Educational Resource: We'll explain some of these concepts in our next articles as we walk you through the corresponding use cases.

## Conclusion

These prerequisites will set you up for success in mastering Reactive Contracts, and fully leveraging their potential in your blockchain projects. Stay tuned for our upcoming article on EVM events that will further solidify your understanding and application of these concepts.

Remember, the blockchain space is ever-evolving, so continuous learning is key. These resources are just the beginning; dive deep, experiment, and don't hesitate to engage with the community for insights and assistance.
---
title: "Reactive Contracts: What They Are and Why We Need Them"
sidebar_position: 1
description: Discover Reactive Contracts (RCs), revolutionizing blockchain interaction with decentralized automation. Join our course to explore their potential, from Uniswap stop orders to NFT synchronization.
slug: reactive-contracts
---

# Reactive Contracts: What They Are and Why We Need Them

## Introduction to Reactive Contracts

Reactive Contracts (RCs) represent a paradigm shift in how we interact with blockchain technology. Unlike traditional smart contracts that are run by user transactions, RCs actively monitor events on EVM-compatible chains and react to them. They process these events according to the implemented logic and execute further actions on the blockchain autonomously. This innovation introduces a decentralized mechanism for automating responses to on-chain events without manual actions.

![Basic Reactive Workflow](./img/basic-reactive-workflow.jpg)

## Why Reactive Contracts

In the Ethereum world, smart contracts have revolutionized how we conceive of executing trustless agreements. Traditionally, these contracts spring into action only upon a user-initiated transaction. This presents inherent limitations. For one, smart contracts can't autonomously initiate actions or respond to blockchain events without an external prompt — either from a user or an automated script like a trading bot. This requires holding private keys and introducing a centralized point of control.

Reactive Contracts (RCs) emerge as a solution to this constraint. RCs are designed to autonomously react to events in the Ethereum Virtual Machine (EVM) and trigger subsequent actions across the blockchain ecosystem. This capability for the implementation of complex logic that can source information from multiple chains and enact changes or transactions across various platforms without a central oversight.

## The Advantages of RCs

**Decentralization:** RCs operate independently on the blockchain, eliminating centralized points of control and improving security by reducing the risk of manipulation or failure.

**Automation:** RCs automatically execute smart contract logic in response to on-chain events, reducing the need for manual interventions and allowing for efficient, real-time responses.

**Cross-Chain Interoperability:** RCs can interact with multiple blockchains, enabling complex cross-chain interactions that enhance versatility and bridge gaps between networks.

**Enhanced Efficiency and Functionality:** By reacting to real-time data, RCs boost the efficiency of smart contracts, supporting advanced functionalities like complex financial instruments, dynamic NFTs, and innovative DeFi applications.

**Innovation in DeFi and Beyond:** RCs enable new possibilities in DeFi and other blockchain applications, such as automated trading and dynamic governance, creating a more responsive and interconnected blockchain ecosystem.

## About This Course

To equip developers with the skills to harness RCs, we've created a comprehensive course with detailed documentation and hands-on tutorials. Our goal is to foster a collaborative space where developers can explore the full potential of RCs.

The course offers lectures, GitHub code examples, and video demonstrations for a multi-faceted learning experience. Whether you're interested in theory or practical [use cases](../use-cases/index.md), this course adapts to your needs.

Throughout the course, we will examine various applications of RCs, including:

* Implementing Uniswap stop orders through RCs
* Synchronizing NFT ownership over several chains
* Automatically collecting staking rewards from different pools and chains

## Conclusion

Reactive Contracts (RCs) represent a major leap in blockchain technology by enabling autonomous execution of complex logic without user intervention. Unlike traditional EVMs, RCs can automatically respond to events from multiple blockchains, allowing for flexible cross-chain interactions. This unique reactivity and versatility make RCs a valuable tool for developers aiming to build more dynamic and interconnected decentralized applications. Join our [Telegram](https://t.me/reactivedevs) group and explore the frontier of blockchain technology, where your creativity and expertise can help shape the future of decentralized applications.
---
title: "Lesson 2: How Events and Callbacks Work"
sidebar_position: 2
description: Discover how EVM events enable smart contracts to communicate with the outside world on the Ethereum blockchain. Learn about event creation, emission, and listening, with a Chainlink's price oracle integration example. Learn on callbacks to destination chains.
slug: how-events-work
---

# Lesson 2: How Events and Callbacks Work

## Overview

In Ethereum, events enable smart contracts to communicate with the external world by logging specific information when certain conditions are met. This allows decentralized applications (dApps) to trigger and respond to occurrences without constantly polling the blockchain. Events are indexed by the EVM, making them easily searchable, which is particularly useful for monitoring blockchain activities like transfers, contract updates, and price changes from oracles.

This lesson focuses on the role of events and callbacks in smart contracts. By learning how to emit, process, and listen to events, developers can create dynamic dApps that respond to blockchain changes in real-time. We will also explore how Reactive Contracts use the `react()` method to handle events and initiate cross-chain transactions through callbacks, enabling improved functionality within the Reactive Network.

By the end of this lesson, you will learn to:

* Define and emit events in an Ethereum smart contract.
* Listen for and process events using decentralized applications.
* Implement event processing in Reactive Contracts.
* Send callbacks to trigger actions on destination chains.

## How EVM Events Work

When a smart contract emits an event, the event data is stored in the transaction's logs. These logs are attached to the blocks of the blockchain but don't directly affect the blockchain state. Instead, they provide a way to record and retrieve information based on the event's parameters.

Developers define events in smart contracts using the `event` keyword, followed by the event name and the data types of the information they want to log. To emit an event, the smart contract uses the `emit` keyword, followed by the event name and the data to be logged.

External applications, such as dApps or backend services, can listen for these events. By specifying the event signature and, optionally, filtering parameters, these applications can subscribe to real-time updates whenever the event is emitted. This mechanism is pivotal for creating responsive and interactive blockchain applications.

## Example: Chainlink Price Oracle Integration

Chainlink's decentralized oracle network provides real-time data feeds for various cryptocurrencies, commodities, and other off-chain data, directly into smart contracts. Let's see how an EVM event can be used in conjunction with Chainlink's price oracle.

### Defining the Price Update Event

Imagine a smart contract that needs real-time price information to execute its logic, such as a DeFi lending platform that adjusts collateral requirements based on the latest market prices. The contract might define an event like this:

```solidity
event PriceUpdated(string symbol, uint256 newPrice);
```

This event is designed to log the symbol of the asset and its new price whenever the price is updated.

### Emitting the Event

When the smart contract receives a new price update from Chainlink's oracle, it emits the `PriceUpdated` event:

```solidity
emit PriceUpdated("ETH", newEthPrice);
```

In this line, `newEthPrice` is the updated price of Ethereum fetched from Chainlink, whose oracle is updated periodically.

### Listening for the Price Update

A dApp or an investor's portfolio management tool can listen for the `PriceUpdated` event to trigger specific actions such as rebalancing a portfolio or issuing a loan. We will use a Reactive Contract to catch these events in later lessons.

## Event Processing in Reactive Contracts

Reactive Contracts must implement the [`IReactive`](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IReactive.sol) interface to handle incoming events.

```solidity
pragma solidity >=0.8.0;

import './IPayer.sol';

interface IReactive is IPayer {
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

    event Callback(
        uint256 indexed chain_id,
        address indexed _contract,
        uint64 indexed gas_limit,
        bytes payload
    );
    
    function react(LogRecord calldata log) external;
}
```

**LogRecord Structure**: A structured data type, `LogRecord`, is defined to contain detailed information about an event log:
- `chain_id`: ID of the blockchain where the event originated.
- `_contract`: Address of the contract that emitted the event.
- `topic_0` to `topic_3`: Indexed topics of the log.
- `data`: Non-indexed data from the event log.
- `block_number`: Block number where the event occurred.
- `op_code`: Potentially denotes an operation code.
- `block_hash`, `tx_hash`, and `log_index`: Additional identifiers to trace the event's origin and context.

**Callback Event**: An event to notify subscribers of specific occurrences:
- `chain_id`: Blockchain ID of the event.
- `_contract`: Address of the emitting contract.
- `gas_limit`: Maximum gas allocated for the callback.
- `payload`: Encoded data accompanying the callback.

**react Function**: A key function that handles incoming event notifications.
- Takes a `LogRecord` as input, enabling reactive contracts to process event logs dynamically.
- Marked as `external`, allowing it to be called only from outside the contract.

The Reactive Network continuously monitors event logs and matches them against the subscription criteria defined in reactive contracts. When an event that meets the criteria is detected, the network triggers the `react()` method, passing in relevant details.

Reactive contracts can access all standard EVM functionalities. However, they run within a private ReactVM, which restricts them to interacting with contracts deployed by the same deployer. This isolation ensures that reactive contracts maintain a controlled and secure environment while processing events from the Reactive Network.

## Callbacks to Destination Chains

Reactive contracts can initiate transactions on destination chains by emitting log records in a specific format. These records are picked up by the Reactive Network, which then carries out the desired transactions on the relevant chain.

### Emitting Callback Events

To request actions on destination chains, the user must trigger a `Callback` event in the Reactive Contract. Once triggered, this event is emitted by the smart contract and provides critical information that the Reactive Network needs to create and submit the transaction.

The `Callback` event includes the following parameters:

- `chain_id`: The EIP155 chain ID of the destination network.
- `_contract`: The address of the destination contract.
- `gas_limit`: The gas limit for the transaction on the destination chain.
- `payload`: Encoded data that specifies a function call on the destination. This data directs the Reactive Network on how to execute the intended action on the destination contract.

Here’s the signature of the `Callback` event:

```solidity
event Callback(
    uint256 indexed chain_id,
    address indexed _contract,
    uint64 indexed gas_limit,
    bytes payload
);
```

### Processing the Callback

When the `Callback` event is emitted, the Reactive Network detects it and processes the `payload`, which encodes the transaction details in a specific format. The Reactive Network then submits a transaction to the specified contract on the destination chain, using the provided `chain_id` and  `gas_limit`.

### Important Note on Authorization

For security and authorization purposes, the Reactive Network automatically replaces the first 160 bits of the call arguments within the `payload` with the RVM ID (equivalent to the ReactVM address) of the calling reactive contract. This RVM ID is identical to the contract deployer's address. As a result, the first argument in your callback will always be the ReactVM address (of type `address`), regardless of the variable name you use in your Solidity code.

### Encoding and Emitting the Callback Event

To initiate actions on a destination chain, you can encode the transaction details into the `payload` and emit the `Callback` event. For example, in the Uniswap Stop Order Demo, this process is used to trigger token sales through the destination chain contract:

 ```solidity
bytes memory payload = abi.encodeWithSignature(
    "stop(address,address,address,bool,uint256,uint256)",
    address(0),  // The ReactVM address
    pair,        // The Uniswap pair address involved in the transaction
    client,      // The address of the client initiating the stop order
    token0,      // The address of the first token in the pair
    coefficient, // A coefficient determining the sale price
    threshold    // The price threshold at which the sale should occur
);
emit Callback(chain_id, stop_order, CALLBACK_GAS_LIMIT, payload);
```

## Conclusion

In this lesson, we've explored the fundamentals of events and callbacks in Ethereum and their application in Reactive Contracts. Key takeaways include:

- **Understanding Events:** Events allow smart contracts to log information and interact with external applications, providing a powerful way to respond to on-chain activities without directly altering the blockchain state.

- **Reactive Contracts and the react() Method:** RCs use the `react()` method to autonomously process incoming events based on specified criteria, enabling real-time, decentralized, and responsive contract behavior.

- **Callbacks for Cross-Chain Transactions:** RCs can initiate actions on different blockchains using callbacks, broadening their functionality beyond single-chain constraints and facilitating more complex decentralized applications.

- **Secure and Controlled Execution:** The ReactVM environment ensures that RCs operate securely by restricting interactions to contracts deployed by the same deployer, maintaining a controlled execution space.

The concepts from this lesson are shown in the [Basic Demo](../use-cases/use-case-1.md) use case. Feel free to explore it and join our [Telegram](https://t.me/reactivedevs) group for additional guidance.
---
title: "Lesson 5: How Oracles Work"
sidebar_position: 5
description: Discover the power of oracles in Reactive Contracts (RCs) and explore their role in integrating real-world data with blockchain applications.
slug: how-oracles-work
---

# Lesson 5: How Oracles Work

## Overview 

Reactive Contracts are adept at monitoring on-chain events and executing subsequent on-chain actions in response. Yet within the smart contract ecosystem, a distinct category exists specifically for importing off-chain data onto the blockchain. These are known as oracles. Among the myriad events to which Reactive Contracts can respond, those emitted by oracles hold significant importance. This article delves deeper into the concept of oracles, setting the stage for a clearer comprehension of the upcoming use case we'll explore. By unpacking the mechanisms and implications of oracles within the blockchain framework, we aim to equip you with the knowledge needed to fully grasp the potential and utility of Reactive Contracts in interacting with real-world data.

By the end of this lesson, you will learn to:

* Understand the role of oracles in bridging the gap between blockchain and real-world data.
* Address the oracle problem by exploring how oracles bring off-chain data onto the blockchain.
* Implement and integrate oracles within smart contracts, using examples like Chainlink to fetch external data.
* Recognize the advantages of combining Reactive Contracts with oracles for real-time interaction with on-chain and off-chain events.

## What Oracles Do

In the realm of blockchain and smart contracts, the necessity to interact with the real world presents a unique challenge. Smart contracts operate in a deterministic environment, where every operation must be verifiable and repeatable. However, to unlock the full potential of smart contracts, there's often a need to access data from the outside world — be it price feeds, weather reports, or other off-chain information. This requirement introduces the oracle problem: how to fetch off-chain data onto the blockchain without sacrificing the core principles of decentralization and trustlessness.

## Addressing the Oracle Problem

The oracle problem is tackled through entities known as oracles, which serve as bridges between the blockchain (on-chain) and the external world (off-chain). Oracles fetch data from a plethora of external sources to feed into the blockchain. This data could stem from APIs of financial marketplaces for price feeds, government databases for public records, or IoT devices for real-world physical data. The crux of an oracle's utility lies in its ability to validate and relay this data to smart contracts in a trust-minimized way.

The question of who signs the transactions for oracles to input data onto the blockchain brings us to the mechanism ensuring the data's integrity and trustworthiness. Typically, transactions are signed using the private keys of the oracle service provider.

To bolster security and mitigate the risks of failure or malicious manipulation, many decentralized oracle networks employ multisig protocols. Multisig requires a predefined number of signatures out of a set of participants to authorize a transaction, ensuring that no single entity can unilaterally submit data to the blockchain. This method adds a layer of decentralization and security to the process, aligning with the trustless nature of blockchain systems.

Some of the popular oracle providers are Chainlink and Band Protocol. These platforms aggregate data from multiple sources, ensuring data integrity and reducing the risk of manipulation.

## Practical Applications and Examples

Oracles unlock a myriad of use cases for smart contracts, allowing them to react to real-world events and data. Some notable applications include:

* DeFi Platforms: Utilizing price feed oracles to manage lending rates, liquidations, and asset swaps.

* Insurance: Triggering payouts based on verifiable events, like natural disasters, reported by trusted oracles.

* Online Betting: Smart contracts provide great tech solutions for trustless online betting, and oracles feed the data about the outcomes of sporting events to such systems.

## Code Example: Using Chainlink Oracles

Here's a simple example of how a smart contract can use Chainlink to fetch a USD/ETH price feed:

```solidity
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {

    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Ethereum Mainnet
     * Aggregator: ETH/USD
     * Address: 0x... (Chainlink ETH/USD Price Feed Contract Address)
     */
    constructor() public {
        priceFeed = AggregatorV3Interface(0x...);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return price;
    }
}
```

This contract demonstrates fetching the latest ETH/USD price using Chainlink's decentralized oracle network. It illustrates how smart contracts can securely and reliably access off-chain data.

However, as you may have observed, the smart contract can only request data through the getLatestPrice() function when it's explicitly called. To ensure your contract's data remains current, you should periodically invoke the function that queries the oracle. This challenge isn't insurmountable; one could simply update the price each time someone interacts with the contract, basing this interaction on the most recent price data. Yet this approach falls short of enabling your system to respond to price changes — or other oracle-generated events — in real time.

In the Ethereum ecosystem, while one smart contract can indeed call another, such calls must initially be triggered by an Externally Owned Account (EOA) address. An EOA is an Ethereum address controlled directly by the private key's owner, unlike smart contract addresses, which are governed by contract code. Consequently, each transaction is initiated and signed by a specific EOA, restricting the capacity for smart contracts to operate in real time. This limitation underscores the distinctive advantage of Reactive Contracts.

## Why We Need Reactive Contracts

Our exploration has previously touched upon the Inversion of Control principle, a defining characteristic of Reactive Contracts. Here, it's worth emphasizing again: Reactive Contracts stand out because they react not just to direct user transactions but to events across various EVM chains. Following these events, they execute on-chain actions, potentially on the same or different chains.

This brings us to the significance of oracles in our discussion: by integrating oracles with Reactive Contracts, we unlock the potential to respond to off-chain events — once brought on-chain by oracles — with predefined on-chain actions as articulated in our Reactive Contracts. This synergy between oracles and Reactive Contracts enables a dynamic, responsive system capable of real-time interaction with both the digital and physical worlds. This broadens the scope and utility of blockchain technology beyond its current constraints.

## Conclusion

In this article, we’ve talked about the role of oracles within the context of Reactive Contracts (RCs), highlighting their significance in bridging the gap between on-chain and off-chain data. Key takeaways include:

- **Oracle Functionality:** Oracles are essential for importing real-world data onto the blockchain, enabling smart contracts to interact with external information such as price feeds, weather reports, and more.

- **Addressing the Oracle Problem:** The oracle problem is mitigated through decentralized oracle networks that ensure data integrity and minimize trust issues. Multisig protocols and reputable providers like Chainlink and Band Protocol enhance security and reliability.

- **Practical Applications:** Oracles facilitate various use cases, including decentralized finance (DeFi), insurance, and online betting, by providing real-time data to smart contracts and enabling automated, trustless interactions.

- **Integration with Reactive Contracts:** The synergy between oracles and RCs allows for dynamic, real-time responses to off-chain events. This integration leverages the strengths of both technologies to enhance the functionality and reach of blockchain applications.

For practical applications and further insights, explore our [use cases](../use-cases/index.md) and join our [Telegram](https://t.me/reactivedevs) group to engage with the community.
---
title: "Module 1: Beginner — Foundations of Reactive Contracts"
sidebar_position: 1
description: Learn the basics of RCs, including their reactive nature, state management, EVM events, and oracles. Ideal for beginners looking to understand and apply RCs in blockchain projects.
slug: /education/module-1
---

# Module 1: Beginner — Foundations of Reactive Contracts

# Overview

Welcome to Module 1: Beginner — Foundations of Reactive Contracts (RCs)! This module introduces the core concepts and functionalities of RCs, providing a foundation for applying them in blockchain projects.

[Lesson 1: Reactive Contracts](./reactive-contracts.md)

Explore the mechanisms of RCs, focusing on their reactive nature and Inversion of Control. Learn through use cases such as data collection with oracles and executing stop orders on decentralized exchanges.

[Lesson 2: How Events and Callbacks Work](./how-events-work.md)

Understand how EVM events and callbacks enable interaction between smart contracts and external systems. Includes a practical example of Chainlink's price oracle integration.

[Lesson 3: ReactVM and Reactive Network As a Dual-State Environment](./react-vm.md)

Examine the dual-state environment of RCs within the Reactive Network and ReactVM. Learn about state management and transaction execution across these domains.

[Lesson 4: How Subscriptions Work](./subscriptions.md)

Learn about setting up and managing subscriptions in RCs to streamline event handling and automate contract execution.

[Lesson 5: How Oracles Work](./how-oracles-work.md)

Discover the role of oracles in connecting blockchain with off-chain data. Explore multisig protocols and practical applications in DeFi, insurance, and online betting.
---
title: "Lesson 3: ReactVM and Reactive Network As a Dual-State Environment"
sidebar_position: 3
description: Understand the dual-state environment of Reactive Contracts. Learn to manage data, identify execution contexts, and handle transactions in both Reactive Network and ReactVM for efficient RC development.
slug: react-vm
---

# Lesson 3: ReactVM and Reactive Network As a Dual-State Environment

## Overview

In [Reactive Contracts](./reactive-contracts), we discuss one of the basic concepts of reactive contracts (RCs) — Inversion of Control, and how events and callbacks work in RCs. This article focuses on another crucial property of RCs: the fact they exist in two instances with separate states in the Reactive Network and ReactVM. Understanding this idea is necessary for successful reactive contract development.

By the end of this lesson, you will learn to:

* Distinguish both environments where a reactive contract is executed.
* Identify the current environment.
* Manage data with two separate states.
* Understand the types of transactions RCs operate with.

## Differences Between the Reactive Network and ReactVM

Each Reactive Contract has two instances — one on the Reactive Network and the other in its separate ReactVM. It is important to note that both instances are physically stored and executed on each network node. Parallelizing RCs is an architectural decision made to ensure high performance even with big numbers of events. We will talk more about that in one of our next articles.

![Reactive Network | React Vm ](./img/reactvm.jpg)

The Reactive Network operates as a typical EVM blockchain with the addition of system contracts that allow subscribing to and unsubscribing from origin chain events on Ethereum, BNB, Polygon, or Optimism. Each deployer address has a dedicated ReactVM.

ReactVM is a restricted virtual machine designed to process events in isolation. Contracts deployed from one address are executed in one ReactVM. They can interact with each other but not with other contracts on the Reactive Network.

Contracts within a single ReactVM can interact with the external world in two ways, both through the Reactive Network:

* They react to specified events to which they are subscribed and are executed when these events occur.

* Based on the execution of the code with the inputs from events, the ReactVM sends requests to the Reactive Network for callbacks to destination chains to perform the resulting on-chain actions.

For each RC deployed, there are two instances of it with separate states but the same code. Each method is expected to be executed in one or both environments and to interact with one or both states. This leads to the question of how we identify, within the code, which state we are currently working with.

### Identifying the Execution Context

The execution context determines whether the contract is running on the Reactive Network or within a ReactVM instance. This distinction is crucial for controlling which functions can be called in which environment. Implement [AbstractReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/abstract-base/AbstractReactive.sol) in your project to get all the necessary functionality. 

#### How Detection Works

Instead of attempting to invoke the system contract in the constructor, the new code uses the function `detectVm()` to inspect the code size at the system contract’s address. The `0x0000000000000000000000000000000000fffFfF` address only has deployed code on the Reactive Network. If there is code at this address, we conclude that we are on the Reactive Network; if not, we are within a ReactVM instance.

```solidity
function detectVm() internal {
    uint256 size;
    // solhint-disable-next-line no-inline-assembly
    assembly { size := extcodesize(0x0000000000000000000000000000000000fffFfF) }
    vm = size == 0;
}
```

**Assembly Check**: An inline assembly snippet checks the size of the contract code at the system contract’s address.

**Setting the vm Flag**: If `size == 0`, there is no code at that address. This indicates that we are running within a ReactVM instance, so `vm` is set to `true`. Otherwise, if `size > 0`, it indicates the presence of the system contract, confirming that we are on the Reactive Network, so `vm` remains `false`.

#### Enforcing Execution Context

We use modifiers to ensure that each function can only be called in its intended environment.

```solidity
modifier rnOnly() {
    require(!vm, 'Reactive Network only');
    _;
}

modifier vmOnly() {
    require(vm, 'VM only');
    _;
}
```

**rnOnly()**: requires that `vm == false`, meaning the function can only run when the contract is deployed to the Reactive Network.

**vmOnly()**: requires that `vm == true`, meaning the function can only run within a ReactVM instance.

### Managing Dual Variable Sets for Each State

In Reactive architecture, each deployed contract can run in two operational states:

**Reactive Network State**

- Interacts directly with system contracts.
- Subscribes to events using `service.subscribe(...)`.
- Uses variables and methods required to register and manage event subscriptions.

**ReactVM State**

- Contains the business logic to react to subscribed events.
- Uses variables and methods that execute upon receiving an event.

To accommodate these states, two conceptual sets of variables are maintained — one set in the base (network-facing) contract context and another set in the ReactVM context. In this new example, the "Reactive Network" variables are inherited from our `AbstractReactive` contract, while the ReactVM variables are declared within a reactive contract itself.

### Reactive Network Variables

If a reactive contract inherits from `AbstractReactive`, the following variables and methods are available behind the scenes:

- `service` (`ISubscriptionService`) for subscribing to events.
- `vm` (bool) that indicates whether the execution is happening on the ReactVM or in the Reactive Network context.
- Additional inherited utility methods (e.g., `service.subscribe(...)`).

In the constructor of the [Uniswap Stop Order reactive contract](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/uniswap-v2-stop-order/UniswapDemoStopOrderReactive.sol), you can notice that `if (!vm)` checks if we are running in the Reactive Network state. If so, the contract registers to receive events from `pair` and `stop_order`. Once subscribed, those events will later trigger our `react()` logic only when we are in the ReactVM state.

```solidity
// State specific to ReactVM instance of the contract.

bool private triggered;
bool private done;
address private pair;
address private stop_order;
address private client;
bool private token0;
uint256 private coefficient;
uint256 private threshold;

constructor(
    address _pair,
    address _stop_order,
    address _client,
    bool _token0,
    uint256 _coefficient,
    uint256 _threshold
) payable {
    triggered = false;
    done = false;
    pair = _pair;
    stop_order = _stop_order;
    client = _client;
    token0 = _token0;
    coefficient = _coefficient;
    threshold = _threshold;

    if (!vm) {
        service.subscribe(
            SEPOLIA_CHAIN_ID,
            pair,
            UNISWAP_V2_SYNC_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
        service.subscribe(
            SEPOLIA_CHAIN_ID,
            stop_order,
            STOP_ORDER_STOP_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }
}
```

### ReactVM Variables

Within the [Uniswap Stop Order reactive contract](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/uniswap-v2-stop-order/UniswapDemoStopOrderReactive.sol), the following variables and methods are used specifically after events are received:

```solidity
bool private triggered;
bool private done;
address private pair;
address private stop_order;
address private client;
bool private token0;
uint256 private coefficient;
uint256 private threshold;
```

These variables handle the logic in the `react()` function:

```solidity
// Methods specific to ReactVM instance of the contract.
function react(LogRecord calldata log) external vmOnly {
    assert(!done);

    if (log._contract == stop_order) {
        if (
            triggered &&
            log.topic_0 == STOP_ORDER_STOP_TOPIC_0 &&
            log.topic_1 == uint256(uint160(pair)) &&
            log.topic_2 == uint256(uint160(client))
        ) {
            done = true;
            emit Done();
        }
    } else {
        Reserves memory sync = abi.decode(log.data, ( Reserves ));
        if (below_threshold(sync) && !triggered) {
            emit CallbackSent();
            bytes memory payload = abi.encodeWithSignature(
                "stop(address,address,address,bool,uint256,uint256)",
                address(0),
                pair,
                client,
                token0,
                coefficient,
                threshold
            );
            triggered = true;
            emit Callback(log.chain_id, stop_order, CALLBACK_GAS_LIMIT, payload);
        }
    }
}
```

- `triggered` prevents multiple callbacks once the threshold condition is satisfied.
- `done` signals that the final stop has occurred.
- `pair`, `stop_order`, and `client` reference external contracts and user data.
- `token0`, `coefficient`, and `threshold` define the math around when to trigger a stop.

The actual logic (checking liquidity reserves and emitting callbacks) is local to ReactVM. Since `react()` is labeled `vmOnly`, it is invoked by the underlying system **only** in the ReactVM context upon matching event logs.

## Transaction Execution

When working with a Reactive Contract (RC), there are two primary environments where transactions occur: the Reactive Network and the ReactVM. Each environment has different rules for initiating and processing transactions, as detailed below. The code is taken from [AbstractPausableReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/abstract-base/AbstractPausableReactive.sol).

### Reactive Network Transactions

Transactions on the Reactive Network can be initiated in two ways: directly by a user or triggered by an event on the origin chain.

#### User-Initiated Transactions

Users can invoke methods on the Reactive Network’s instance of an RC to perform administrative functions or update contract state. For instance, pausing event subscriptions is done by calling the `pause()` function:

```solidity
function pause() external rnOnly onlyOwner {
        require(!paused, 'Already paused');
        Subscription[] memory subscriptions = getPausableSubscriptions();
        for (uint256 ix = 0; ix != subscriptions.length; ++ix) {
            service.unsubscribe(
                subscriptions[ix].chain_id,
                subscriptions[ix]._contract,
                subscriptions[ix].topic_0,
                subscriptions[ix].topic_1,
                subscriptions[ix].topic_2,
                subscriptions[ix].topic_3
            );
        }
        paused = true;
}
```

- `rnOnly` ensures that only the Reactive Network can call this function.
- `onlyOwner` limits the call to the contract owner.
- `service.unsubscribe()` removes the contract from listening to specific events (defined by `chain_id`, `topic_0`, etc.).

This `pause()` function prevents the RC from reacting to events by unsubscribing from them, effectively stopping further event-driven transactions until it is resumed.

The corresponding `resume()` function re-subscribes to those same events so that the RC can continue responding when new events are emitted:

```solidity
function resume() external rnOnly onlyOwner {
    require(paused, 'Not paused');
    Subscription[] memory subscriptions = getPausableSubscriptions();
    for (uint256 ix = 0; ix != subscriptions.length; ++ix) {
        service.subscribe(
            subscriptions[ix].chain_id,
            subscriptions[ix]._contract,
            subscriptions[ix].topic_0,
            subscriptions[ix].topic_1,
            subscriptions[ix].topic_2,
            subscriptions[ix].topic_3
        );
    }
    paused = false;
}
```

#### Event-Triggered Transactions

Even if a user does not directly initiate a transaction, the Reactive Network monitors events on the origin chain. When an event of interest is emitted, the Reactive Network dispatches it to all active subscribers, typically specialized ReactVM instances. This dispatch triggers further action or state changes in the subscribers.

### ReactVM Transactions

Within the ReactVM, transactions can't be called directly by users. Instead, they are triggered automatically when the Reactive Network forwards relevant events from the origin chain:

- Event emitted on origin chain
- Reactive Network dispatches event
- ReactVM receives and processes Event

When an RC running in the ReactVM receives an event, it typically calls its core reaction function `react()` to handle the event. The `react()` function contains the business logic for:

- Updating internal state based on the received event.
- Emitting callbacks to destination chains, which can then trigger transactions on those chains.

Thus, any callback or subsequent transaction to another chain is automatically initiated by the `ReactVM` in response to the received event, rather than manually triggered by a user.

We will consider other examples of `react()` functions for different use cases closely in our next lessons.

## Conclusion

In this lesson, we've explored how Reactive Contracts (RCs) function within two distinct environments: the Reactive Network and the ReactVM. Understanding the dual-state nature of RCs is crucial for their effective development. Key takeaways include:

- **Dual-State Environments:** RCs exist in two instances, each with separate states but the same code — one in the Reactive Network and one in the ReactVM. This setup allows for parallel processing and high performance.

- **Identifying Execution Context:** The environment in which the contract is executing is identified using a boolean variable (`vm`). This allows for precise control over which code and state are accessed, ensuring the correct execution flow.

- **Managing Separate States:** RCs maintain separate sets of variables for the Reactive Network and ReactVM, which are used according to the environment in which the contract is executed. This helps in maintaining clarity and avoiding conflicts between the two states.

- **Transaction Types:** The Reactive Network handles transactions initiated by users or triggered by events on the origin chain, while the ReactVM processes events and executes the `react()` function, defining the reaction logic and initiating cross-chain callbacks.

Explore more practical applications in our [use cases](../use-cases/index.md) and join our [Telegram](https://t.me/reactivedevs) group for additional guidance.

---
title: "Lesson 1: Reactive Contracts"
sidebar_position: 1
description: Learn how RCs autonomously respond to blockchain events, contrasting traditional smart contracts. Understand Inversion of Control (IoC) and discover practical use cases.
slug: reactive-contracts
---

# Lesson 1: Reactive Contracts

## Overview

In the [introduction article](../introduction/reactive-contracts), we discuss the basics of Reactive Contracts (RCs), what they are, and why we need them. Let's dive deeper into the technical concepts of RCs with some examples to illustrate those concepts.

By the end of this lesson, you will learn to:

* Understand the key differences between Reactive Contracts (RCs) and traditional smart contracts.
* Grasp the concept of Inversion of Control and its significance in RCs.
* Recognize how RCs autonomously monitor and react to blockchain events.
* Explore various practical use cases where RCs can be applied, such as data collection from oracles, UniSwap stop orders, DEX arbitrage, and pools rebalancing.

## How RCs Differ from Traditional Smart Contracts

The main distinction between RCs and traditional smart contracts lies in reactivity. Traditional smart contracts are passive, only executing in response to direct EOA transactions. In contrast, RCs are reactive, continuously monitoring the blockchains for events of interest and autonomously executing predefined blockchain actions in response.

## Inversion of Control

A key concept in understanding RCs is the Inversion of Control (IoC). Traditional smart contracts operate under a direct control model, where the execution of their functions is initiated by external actors (EOA users or bots). RCs, however, invert this control by autonomously deciding when to execute based on the occurrence of predefined events. This IoC paradigm shifts how applications interact with the blockchain, enabling more dynamic and responsive systems.

![Inversion of Control](./img/inversion-of-control.jpg)

Without a reactive contract, you would need to set up a separate entity — let's say a bot — to monitor the blockchains using existing, most likely centralized, data solutions. This bot would hold the private keys for the managed funds and initiate transactions on EVM chains from its EOA address. Though such systems prove to be useful, they might be suboptimal for some use cases and not suitable at all for others.

Inversion of Control allows us to avoid hosting additional entities that emulate humans signing transactions. If you have a predefined scenario outlining the sequence of transactions following on-chain events, you should be able to run this logic in a completely decentralized manner, as both your inputs and outputs remain on the blockchain. The Reactive Network gives smart contracts the property they’ve been missing from the start — the ability to be executed automatically, without a person (or a bot) signing a transaction, just based on other on-chain events.

## What Happens Inside a Reactive Contract

When creating a Reactive Contract, the first thing you need to specify is the chains, contracts, and events (topic 0) of interest. The RC will monitor these addresses for the specified events and initiate execution when one is detected. These events can include simple currency or token transfers, DEX swaps, loans, flash loans, votes, whale moves, or any other smart contract activity.

Once an event of interest is detected, the Reactive Network automatically executes the logic you’ve implemented in your reactive contract. This may involve performing calculations based on the event data. RCs are stateful, meaning they have a state where values can be stored and updated. You can accumulate data over time in the state and then act when the combination of historical data and a new blockchain event meets the specified criteria.

As a result of the event, the RC updates its state, keeping it up to date, and can initiate transactions on EVM blockchains. The entire process runs trustlessly within the Reactive Network, ensuring automatic, fast, and reliable execution.

## Use Cases

Let's take a closer look at several use cases to illustrate the concepts we’ve just discussed. This educational course will be structured around those use cases because we see practical application as the best way to learn about this tech.

### Collecting Data from Several Oracles

For RCs to respond to a broader spectrum of events, including off-chain occurrences, they integrate with oracles. Oracles are third-party services that feed trusted external data into the blockchain. A simple example of such data includes exchange rates or sports event outcomes. RCs can use this data to make informed decisions and execute actions based on real-world events, extending their applicability beyond the blockchain.

Moreover, since an RC can monitor data from different smart contracts across various EVM-compatible blockchains, it can combine data from multiple oracles, resulting in more precise and decentralized information. In this case, the events that RCs will monitor are the updated events from the corresponding oracles. The calculations within the RC will involve combining data from different oracles (for example, by taking the average). The resulting action might be a trustless payout based on the outcome of a basketball game.

### Uniswap Stop Order

Another example of a reliable data source on the blockchain is a trading pool, such as a Uniswap pool. It can be even more dependable than oracles since it consists of pure on-chain data and does not rely on third parties.

In this setup, a reactive contract would monitor the swaps in the specified UniSwap pool, calculating the liquidity and the exchange rate. When the exchange rate reaches a predetermined price, the reactive contract executes a swap transaction, thereby implementing a trustless stop order on top of the existing DEX.

### DEX Arbitrage

However, we can take the previous example further by implementing an actual arbitrage using RCs. Our reactive contract will monitor several different pools for price discrepancies and capitalize on them. Both one-chain and cross-chain approaches are possible. In the first case, we can use flash loans; in the second case, we will need liquidity on several chains, but we will gain access to more arbitrage opportunities.

The beauty of this solution is that it will be decentralized, unlike the traditional approach with bots. This allows for numerous improvements that we have yet to explore — hopefully, together with you.

### Pools Rebalancing

While all the previous use cases involve building RCs on top of existing traditional Smart Contracts, the next one requires initially developing a DApp that relies on RCs. If we design our system from the start, knowing that we can leverage the Reactive Network technology, we can build our Ethereum Smart Contracts utilizing the functionality of RCs.

This approach allows us to potentially create liquidity pools that automatically rebalance across several exchanges. The RC will monitor liquidity on all chains of interest and rebalance them by adding or draining funds as needed.

## Conclusion

After reading this lesson, you should have a solid understanding of the foundational concepts and potential applications of Reactive Contracts (RCs). Key takeaways include:

- **Reactive vs. Traditional Contracts:** Unlike traditional smart contracts, RCs autonomously monitor blockchain events and execute actions without user intervention, providing a more dynamic and responsive system.

- **Inversion of Control:** RCs invert the traditional execution model by allowing the contract itself to decide when to execute based on predefined events, eliminating the need for external triggers like bots or users.

- **Decentralized Automation:** RCs enable fully decentralized operations, automating processes like data collection, DEX trading, and liquidity management without centralized intermediaries.

- **Cross-Chain Interactions:** RCs can interact with multiple blockchains and sources, enabling sophisticated use cases like cross-chain arbitrage and multi-oracle data aggregation.

- **Practical Applications:** RCs have diverse applications, including collecting data from oracles, implementing UniSwap stop orders, executing DEX arbitrage, and automatically rebalancing pools across exchanges.

Explore more practical applications in our [use cases](../use-cases/index.md) and join our [Telegram](https://t.me/reactivedevs) group to contribute to the evolving world of Reactive Contracts.
---
title: "Lesson 4: How Subscriptions Work"
sidebar_position: 4
description: Understand how to implement subscriptions in the constructor of reactive contracts and how to manage subscriptions dynamically using callbacks to destination chains 
slug: how-subscriptions-work
---

# Lesson 4: How Subscriptions Work

## Overview

In the previous lesson, we covered the basic differences between the Reactive Network and ReactVM. In this one, we will dive into subscriptions, a key feature that allows RCs to automatically respond to events emitted by other contracts. When these events occur, the subscribing contract can automatically execute predefined logic.

By the end of this article, you will learn to:

* Configure and manage subscriptions both statically and dynamically.
* Handle subscription and unsubscription events within your smart contracts.
* Recognize the limitations and best practices for using subscriptions in Reactive Contracts.

## How to Implement Subscriptions

In reactive contracts, subscriptions are set up using the `subscribe` method from the Reactive Network’s system contract. Typically, this is done in the constructor to initialize subscriptions, though they can also be managed dynamically. We’ll discuss [dynamic subscriptions](./how-subscriptions-work#dynamic-subscriptions) closer to the end of this article.

The reactive contract must also handle reverts due to deployments on both the Reactive Network, which has the system contract, and their deployer's private ReactVM, where the system contract is not present.

### ISubscriptionService Interface

The [ISubscriptionService](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/ISubscriptionService.sol) interface serves as an event subscription service for reactive contracts that can use this service to subscribe to specific events based on certain criteria and receive notifications when those events occur.

```solidity
pragma solidity >=0.8.0;

import './IPayable.sol';

interface ISubscriptionService is IPayable {
    function subscribe(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3
    ) external;
    
    function unsubscribe(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3
    ) external;
}
```

The parameters of both functions mirror each other:
- `chain_id`: A `uint256` representing the `EIP155` source chain ID for the event.
- `_contract`: The address of the origin chain contract that emitted the event.
- `topic_0`, `topic_1`, `topic_2`, `topic_3`: The topics of the event, which are `uint256` values.

Unsubscribing is an expensive operation due to the necessity of searching and removing subscriptions. Duplicate or overlapping subscriptions are allowed, but clients must ensure idempotency.

### IReactive Interface

The [IReactive](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IReactive.sol) interface defines a standard for reactive contracts that can receive and handle notifications about events matching their subscriptions. It extends the [IPayer](https://github.com/Reactive-Network/reactive-lib/blob/main/src/interfaces/IPayer.sol) interface, indicating that it includes payment-related functionalities.

```solidity
pragma solidity >=0.8.0;

import './IPayer.sol';

interface IReactive is IPayer {
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

    event Callback(
        uint256 indexed chain_id,
        address indexed _contract,
        uint64 indexed gas_limit,
        bytes payload
    );
    
    function react(LogRecord calldata log) external;
}
```

**LogRecord Struct**: A data structure representing a detailed log of an event, including:
- `chain_id`: The ID of the originating blockchain.
- `_contract`: The contract address where the event occurred.
- `topic_0` to `topic_3`: Indexed topics of the event log.
- `data`: Additional unindexed event data.
- `block_number`: The block number when the event was logged.
- `op_code`: An operation code for event categorization.
- `block_hash`: The hash of the block containing the event.
- `tx_hash`: The transaction hash that triggered the event.
- `log_index`: The index of the log within the transaction.

**Callback Event**: An event emitted to signal that a reactive contract has been triggered. It includes:
- `chain_id`: The ID of the originating blockchain.
- `_contract`: The address of the contract emitting the event.
- `gas_limit`: The maximum gas allocated for the callback.
- `payload`: The data payload sent during the callback.

**react Function**: The main entry point for processing event notifications.
- `log` (of type `LogRecord`): Contains event details.

### Constructor Subscribtion

Here’s how you can subscribe in the constructor:

```solidity
// State specific to reactive network instance of the contract
address private _callback;

// State specific to ReactVM instance of the contract
uint256 public counter;

constructor(
        address _service,
        address _contract,
        uint256 topic_0,
        address callback
    ) payable {
        service = ISystemContract(payable(_service));
        if (!vm) {
            service.subscribe(
                CHAIN_ID,
                _contract,
                topic_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
        }
        _callback = callback;
    }
```

### Subscription Criteria

When configuring subscriptions in reactive contracts, you should adhere to the following rules:

- Wildcard Usage: Use `address(0)` to indicate filtering by any contract address, `uint256(0)` to indicate any chain ID, and `REACTIVE_IGNORE` for topics to filter by any topic.

- Concrete Values: At least one criterion must be a specific value to ensure meaningful subscriptions.

### Examples

#### Subscribing to All Events from a Specific Contract

Here’s how you can subscribe to all events from a specific contract at `0x7E0987E5b3a30e3f2828572Bb659A548460a3003`:

```solidity
service.subscribe(CHAIN_ID, 0x7E0987E5b3a30e3f2828572Bb659A548460a3003, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE)
```

#### Subscribing to a Specific Event Topic (Uniswap V2 Sync)

Another option is to subscribe to all Uniswap V2 Sync events with `topic_0` `0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1`:

```solidity
service.subscribe(CHAIN_ID, 0, 0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE)
```

#### Combining Parameters

You can combine these parameters to subscribe to the events of a specific contract at `0x7E0987E5b3a30e3f2828572Bb659A548460a3003` with `topic_0` `0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1`:

```solidity
service.subscribe(CHAIN_ID, 0x7E0987E5b3a30e3f2828572Bb659A548460a3003, 0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1, REACTIVE_IGNORE, REACTIVE_IGNORE, REACTIVE_IGNORE)
```

#### Handling Multiple Events from Different Origins

To react to multiple events from different origins, you can use multiple `subscribe` calls in the constructor:

```solidity
constructor(
    address _service,
    address _contract1,
    address _contract2,
    uint256 topic_0,
    address callback
) payable {
    // Initialize the subscription service
    SubscriptionService service = SubscriptionService(payable(_service));

    if (!vm) {
        // First subscription
        service.subscribe(
            CHAIN_ID,
            _contract1,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );

        // Second subscription
        service.subscribe(
            CHAIN_ID,
            address(0),
            topic_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );

        // Add more subscriptions here as needed
    }

    // Assign the callback
    _callback = callback;
}
```

### Prohibited Subscriptions

- **Non-Equality Operations**: Subscriptions can’t match event parameters using less than (\<), greater than (\>), range, or bitwise operations. Only strict equality is supported.

- **Complex Criteria Sets**: Subscriptions can’t use disjunction or sets of criteria within a single subscription. While calling the `subscribe()` method multiple times can achieve similar results, it may lead to combinatorial explosion.

- **Single Chain and All Contracts**: Subscribing to events from all chains or all contracts simultaneously is not allowed. Subscribing to all events from only one chain is also prohibited, as it is considered unnecessary.

- **Duplicate Subscriptions**: While duplicate subscriptions are technically allowed, they function as a single subscription. Users are charged for each transaction sent to the system contract. Preventing duplicates in the system contract is costly due to EVM storage limitations, so duplicate subscriptions are permitted to keep costs manageable.

## Dynamic Subscriptions

Reactive contracts can dynamically manage their subscriptions based on incoming events. Since the system contract responsible for managing subscriptions is only accessible from the Reactive Network, the ReactVM's contract copy handles these operations and communicates with the Reactive Network using callbacks. You can read more on that in [ReactVM and Reactive Network As a Dual-State Environment](./react-vm). Below is an example of how you can make a dynamic subscription, based on the [Approval Magic Demo](https://github.com/Reactive-Network/reactive-smart-contract-demos/tree/main/src/demos/approval-magic).

### Imports and Initialization

Initialize the contract by declaring constants and variables that will be used throughout the contract:

```solidity
pragma solidity >=0.8.0;

import '../../../lib/reactive-lib/src/abstract-base/AbstractReactive.sol';
import './ApprovalService.sol';

contract ApprovalListener is AbstractReactive {
    uint256 private constant REACTIVE_CHAIN_ID = 0x512578;
    uint256 private constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 private constant SUBSCRIBE_TOPIC_0 = 0x1aec2cf998e5b9daa15739cf56ce9bb0f29355de099191a2118402e5ac0805c8;
    uint256 private constant UNSUBSCRIBE_TOPIC_0 = 0xeed050308c603899d7397c26bdccda0810c3ccc6e9730a8a10c452b522f8edf4;
    uint256 private constant APPROVAL_TOPIC_0 = 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925;
    uint64 private constant CALLBACK_GAS_LIMIT = 1000000;

    address private owner;
    ApprovalService private approval_service;
```


**Constants**:
- `REACTIVE_CHAIN_ID`: Represents the ID of the Reactive network.
- `SEPOLIA_CHAIN_ID`: Represents the Sepolia test network.
- `SUBSCRIBE_TOPIC_0`, `UNSUBSCRIBE_TOPIC_0`, `APPROVAL_TOPIC_0`: Topics used to identify the different types of actions (subscription, unsubscription, and approval) in the Reactive Network.
- `CALLBACK_GAS_LIMIT`: The maximum gas allowed for callback operations.

**State Variables**:
- `owner`: The address of the contract owner, typically the one who deployed the contract.
- `approval_service`: An instance of the ApprovalService contract, used to manage subscription-related operations.

### Constructor

The constructor sets up the contract's initial state, including registering for the relevant subscription and unsubscription events.

```solidity
    constructor(
        ApprovalService service_
    ) payable {
        owner = msg.sender;
        approval_service = service_;

        if (!vm) {
            service.subscribe(
                SEPOLIA_CHAIN_ID,
                address(approval_service),
                SUBSCRIBE_TOPIC_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
            service.subscribe(
                SEPOLIA_CHAIN_ID,
                address(approval_service),
                UNSUBSCRIBE_TOPIC_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );

        }
    }
```

**Constructor Parameters**:
- `service_`: The address of the `ApprovalService` contract to interact with for subscription management.

**Initialization**:
- `owner` is set to the address that deploys the contract.
- `approval_service` is set to the provided `ApprovalService` contract instance.
- If the environment is not `vm` instance, the constructor subscribes to the relevant topics (subscription and unsubscription) by calling `service.subscribe` for both `SUBSCRIBE_TOPIC_0` and `UNSUBSCRIBE_TOPIC_0`.

### Authorization

This modifier restricts the execution of certain functions to only authorized callers (the service contract and the owner).

```solidity
modifier callbackOnly(address evm_id) {
        require(msg.sender == address(service), 'Callback only');
        require(evm_id == owner, 'Wrong EVM ID');
        _;
    }
```

**Conditions**:
- The `msg.sender` must be the service contract.
- The `evm_id` passed to the function must match the owner address.

**Functionality**: This ensures that only the service contract or the owner can trigger certain actions, preventing unauthorized access.

### Subscribing & Unsubscribing

These functions allow the contract to subscribe or unsubscribe a subscriber address to/from the `APPROVAL_TOPIC_0` in the Reactive Network.

```solidity
    // Methods specific to reactive network contract instance
    function subscribe(address rvm_id, address subscriber) external rnOnly callbackOnly(rvm_id) {
        service.subscribe(
            SEPOLIA_CHAIN_ID,
            address(0),
            APPROVAL_TOPIC_0,
            REACTIVE_IGNORE,
            uint256(uint160(subscriber)),
            REACTIVE_IGNORE
        );
    }

    function unsubscribe(address rvm_id, address subscriber) external rnOnly callbackOnly(rvm_id) {
        service.unsubscribe(
            SEPOLIA_CHAIN_ID,
            address(0),
            APPROVAL_TOPIC_0,
            REACTIVE_IGNORE,
            uint256(uint160(subscriber)),
            REACTIVE_IGNORE
        );
    }
```

**Parameters**:
- `rvm_id`: The ID of the reactive virtual machine (RVM).
- `subscriber`: The address that will be subscribed or unsubscribed.

**Operations**:
- `subscribe`: Registers a subscriber to the `APPROVAL_TOPIC_0`.
- `unsubscribe`: Removes a subscriber from the `APPROVAL_TOPIC_0`.

### react Function & Logic

The function processes incoming log records from the ReactVM and executes different actions based on the topic in the log.

```solidity
// Methods specific to ReactVM contract instance
    function react(LogRecord calldata log) external vmOnly {
        if (log.topic_0 == SUBSCRIBE_TOPIC_0) {
            bytes memory payload = abi.encodeWithSignature(
                "subscribe(address,address)",
                address(0),
                address(uint160(log.topic_1))
            );
            emit Callback(REACTIVE_CHAIN_ID, address(this), CALLBACK_GAS_LIMIT, payload);
        } else if (log.topic_0 == UNSUBSCRIBE_TOPIC_0) {
            bytes memory payload = abi.encodeWithSignature(
                "unsubscribe(address,address)",
                address(0),
                address(uint160(log.topic_1))
            );
            emit Callback(REACTIVE_CHAIN_ID, address(this), CALLBACK_GAS_LIMIT, payload);
        } else {
            (uint256 amount) = abi.decode(log.data, (uint256));
            bytes memory payload = abi.encodeWithSignature(
                "onApproval(address,address,address,address,uint256)",
                address(0),
                address(uint160(log.topic_2)),
                address(uint160(log.topic_1)),
                log._contract,
                amount
            );
            emit Callback(SEPOLIA_CHAIN_ID, address(approval_service), CALLBACK_GAS_LIMIT, payload);
        }
    }
}
```

**Log Processing**:
- Subscribe Logic: If the log's `topic_0` matches the `SUBSCRIBE_TOPIC_0`, the function encodes a payload for the `subscribe()` method and emits a callback.
- Unsubscribe Logic: If the log's `topic_0` matches the `UNSUBSCRIBE_TOPIC_0`, the function encodes a payload for the `unsubscribe()` method and emits a callback.
- Approval Logic: For any other log, it decodes the approval amount and creates a payload for the `onApproval` method, then emits a callback to the `approval_service` on Sepolia.

**Callback Emission**: The function uses the emit `Callback` statement to send the appropriate payload and trigger the corresponding action on the Reactive chain.

## Conclusion

In this article, we’ve explored the use of subscriptions in Reactive Contracts, a fundamental feature that enables automatic responses to events from other contracts. Key takeaways include:

- **Subscription Setup:** Subscriptions are established using the `subscribe` method from the Reactive Network’s system contract. This can be done statically in the constructor or managed dynamically as needed.

- **Subscription Criteria:** Proper configuration is essential for effective subscriptions. Wildcards and specific values are used to define the scope of events to which a contract subscribes. Avoid prohibited subscription patterns to ensure efficient operation.

- **Dynamic Management:** Subscriptions can be dynamically adjusted based on incoming events, with the `react()` method playing a central role in managing these operations. This approach ensures that RCs can respond in real-time to changes in the network.

- **Handling Events:** Contracts must handle events carefully by preparing appropriate payloads for subscription, unsubscription, and approval actions. This ensures accurate and timely updates across the network.

For practical applications and further insights, explore our [use cases](../use-cases/index.md) and join our [Telegram](https://t.me/reactivedevs) group to engage with the community.

---
title: "Lesson 7: Implementing Basic Reactive Functions"
sidebar_position: 2
description: Learn to implement Reactive Contracts for Uniswap V2, automate stop orders, and understand their execution based on Sync events.
slug: basic-reactive-functions
---

# Lesson 7: Implementing Basic Reactive Functions

## Overview

In this lesson, we’ll go through the Reactive Contract (RC) specifically designed for the Uniswap V2 platform, aimed at executing stop orders based on predefined conditions. By the end of this lesson, you’ll know:

* That RCs are pretty similar to Ethereum smart contracts and thus easy to understand.
* What each part of the stop-order reactive contract means.
* How this reactive contract is executed and what it does.

## Contract

The [UniswapDemoStopOrderReactive](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/uniswap-v2-stop-order/UniswapDemoStopOrderReactive.sol) contract is set up to monitor liquidity pool events on Uniswap V2, namely tracking the `Sync` events to determine when the conditions for a stop order are met. When these conditions are triggered, it executes a callback transaction on the Ethereum blockchain to perform the stop order.

## Key Components

### Event Declarations

Event Declarations: Events like `Subscribed`, `VM`, `AboveThreshold`, `CallbackSent`, and `Done` are used for logging and tracking the contract's operations on the blockchain.

```solidity
// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity >=0.8.0;

import '../../../lib/reactive-lib/src/interfaces/IReactive.sol';
import '../../../lib/reactive-lib/src/abstract-base/AbstractReactive.sol';

    struct Reserves {
        uint112 reserve0;
        uint112 reserve1;
    }

contract UniswapDemoStopOrderReactive is IReactive, AbstractReactive {
    event Subscribed(
        address indexed service_address,
        address indexed _contract,
        uint256 indexed topic_0
    );

    event VM();
    event AboveThreshold(
        uint112 indexed reserve0,
        uint112 indexed reserve1,
        uint256 coefficient,
        uint256 threshold
    );

    event CallbackSent();
    event Done();
```

### Contract Variables

`UNISWAP_V2_SYNC_TOPIC_0` and `STOP_ORDER_STOP_TOPIC_0` are constants representing the topics for Uniswap's `Sync` events and the contract's `Stop` events, respectively. `CALLBACK_GAS_LIMIT` is the gas limit set for the callback transaction. Variables like `triggered`, `done`, `pair`, `stop_order`, `client`, `token0`, `coefficient`, and `threshold` store the state and configuration of the stop order.

```solidity
    uint256 private constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 private constant UNISWAP_V2_SYNC_TOPIC_0 = 0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1;
    uint256 private constant STOP_ORDER_STOP_TOPIC_0 = 0x9996f0dd09556ca972123b22cf9f75c3765bc699a1336a85286c7cb8b9889c6b;
    uint64 private constant CALLBACK_GAS_LIMIT = 1000000;

    // State specific to ReactVM instance of the contract.
    
    bool private triggered;
    bool private done;
    address private pair;
    address private stop_order;
    address private client;
    bool private token0;
    uint256 private coefficient;
    uint256 private threshold;
```

## Contract Logic

### Constructor

The constructor initializes the contract by storing references to the Uniswap V2 pair (`_pair`), the stop-order contract (`_stop_order`), and the client (`_client`). It also records a boolean flag (`_token0`), which indicates whether this contract is managing `token0` or `token1`, and sets the `coefficient` and `threshold` parameters that handle its behavior.

After these values are stored, the contract subscribes to the Uniswap V2 pair and stop-order contract events, but only if it is not operating in a reactVM instance. Subscribing to these events ensures the contract will be notified of any relevant updates, specifically `UNISWAP_V2_SYNC_TOPIC_0` from the Uniswap pair and `STOP_ORDER_STOP_TOPIC_0` from the stop-order contract.

```solidity
    constructor(
        address _pair,
        address _stop_order,
        address _client,
        bool _token0,
        uint256 _coefficient,
        uint256 _threshold
    ) payable {
        triggered = false;
        done = false;
        pair = _pair;
        stop_order = _stop_order;
        client = _client;
        token0 = _token0;
        coefficient = _coefficient;
        threshold = _threshold;

        if (!vm) {
            service.subscribe(
                SEPOLIA_CHAIN_ID,
                pair,
                UNISWAP_V2_SYNC_TOPIC_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
            service.subscribe(
                SEPOLIA_CHAIN_ID,
                stop_order,
                STOP_ORDER_STOP_TOPIC_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
        }
    }
```

### react() Function

The `react()` function processes incoming blockchain events and determines if actions need to be triggered based on the event type:

**Stop-Order Events**: If the event originates from the stop-order contract, the function verifies that the event matches the expected topics and addresses (`pair` and `client`). Once confirmed and if the stop order has already been triggered (`triggered = true`), the contract marks the operation as completed (`done = true`) and emits the `Done` event.

**Uniswap Pair Sync Events**: For events originating from the Uniswap pair contract (specifically `Sync` events), the function decodes the reserves data to check if the conditions for triggering the stop-order are met. This check is performed using the `below_threshold` function, which calculates whether the reserve ratio falls below the defined threshold. If the condition is satisfied, the contract emits a `CallbackSent` event, prepares the callback payload, sets `triggered = true`, and emits a `Callback` event to execute the stop order.

```solidity
    // Methods specific to ReactVM instance of the contract.
    function react(LogRecord calldata log) external vmOnly {
        assert(!done);

        if (log._contract == stop_order) {
            if (
                triggered &&
                log.topic_0 == STOP_ORDER_STOP_TOPIC_0 &&
                log.topic_1 == uint256(uint160(pair)) &&
                log.topic_2 == uint256(uint160(client))
            ) {
                done = true;
                emit Done();
            }
        } else {
            Reserves memory sync = abi.decode(log.data, ( Reserves ));
            if (below_threshold(sync) && !triggered) {
                emit CallbackSent();
                bytes memory payload = abi.encodeWithSignature(
                    "stop(address,address,address,bool,uint256,uint256)",
                    address(0),
                    pair,
                    client,
                    token0,
                    coefficient,
                    threshold
                );
                triggered = true;
                emit Callback(log.chain_id, stop_order, CALLBACK_GAS_LIMIT, payload);
            }
        }
    }
```

### below_threshold() Function

The `below_threshold()` function checks whether the current reserves in the Uniswap pool satisfy the conditions for executing a stop order. It compares the reserve ratio to a predefined threshold based on the selected token (either `token0` or `token1`).

If `token0` is selected, the function checks if the ratio of `reserve1` to `reserve0`, multiplied by a coefficient, is less than or equal to the threshold. If `token0` is not selected, the function checks if the ratio of `reserve0` to `reserve1`, multiplied by the coefficient, is less than or equal to the threshold.

```solidity
    function below_threshold(Reserves memory sync) internal view returns (bool) {
        if (token0) {
            return (sync.reserve1 * coefficient) / sync.reserve0 <= threshold;
        } else {
            return (sync.reserve0 * coefficient) / sync.reserve1 <= threshold;
        }
    }
```

## Execution Flow

**Initialization**: Upon deployment, the contract subscribes to the necessary events from the Uniswap V2 pair and the stop order callback contract.

**Event Monitoring**: The contract listens for Sync events from the Uniswap pair to monitor the pool's reserve changes and`Stop` events from the stop-order contract to track the execution of orders.

**Stop Order Activation**: When the `Sync` event indicates that the pool's price hits the threshold, the contract initiates the stop order through the callback function, executing a trade on Uniswap V2.

**Completion**: After the stop order is executed, the contract captures the Stop event from the stop-order contract, marking the process as complete.


## Conclusion

In this article, we’ve examined the implementation of a Reactive Contract (RC) for managing stop orders on the Uniswap V2 platform. Key takeaways include:

- **Similarity to Ethereum Smart Contracts:** RCs are conceptually similar to Ethereum smart contracts, making them accessible for those familiar with Ethereum's architecture.

- **Contract Components:** We reviewed the key elements of the stop-order reactive contract, including event declarations, contract variables, and the logic behind the `react()` and `below_threshold()` functions.

- **Execution Flow:** The contract’s lifecycle involves subscribing to relevant events, monitoring Uniswap V2 pool reserves, triggering stop orders when conditions are met, and capturing completion events to finalize the process.

For a deeper look into practical applications, explore the [Uniswap Stop Order](../use-cases/use-case-3) use case and consider experimenting with these concepts in your own projects. Join our [Telegram](https://t.me/reactivedevs) group to engage with the community.

---
title: "Lesson 6: How Uniswap Works / Understanding Uniswap V2 Pools and Smart Contracts"
sidebar_position: 1
description: Discover how Uniswap V2 pools and smart contracts work, including the constant product formula and key events like Swap and Sync. Learn about token swaps, liquidity provisioning, and see a smart contract example.
slug: how-uniswap-works
---

# Lesson 6: How Uniswap Works / Understanding Uniswap V2 Pools and Smart Contracts

## Overview

Uniswap V2, a decentralized finance protocol, operates on the Ethereum blockchain, facilitating automated trading of decentralized tokens. At its core are liquidity pools and smart contracts that enable seamless token swaps. Understanding Uniswap-like DEXes is crucial for understanding DeFi, smart contract applications, and Reactive use cases. By the end of this lesson, you'll be equipped with knowledge on:

* The structure and function of Uniswap V2 pools, including how they facilitate token swaps and liquidity provisioning.
* The constant product formula (x * y = k) that governs the pricing mechanism within Uniswap V2.
* The execution and significance of Swap and Sync events in maintaining pool dynamics and providing transparency.
* A practical understanding through a code example that demonstrates the swap function within Uniswap V2's smart contracts.

## Uniswap V2 Pools

Liquidity pools in Uniswap V2 are essentially reserves of two tokens, forming a trading pair. These pools are the backbone of the Uniswap ecosystem, allowing users to trade tokens without the need for traditional market makers.

In Uniswap V2, each trade or liquidity provision is executed through transactions on the Ethereum blockchain. These transactions are public and can be [viewed on Etherscan](https://etherscan.io/tx/0x7b969e8a74ae9891e322311ca5fe6e5d7bcb53ac3412b4189d84683961043503) or similar block explorers.

Smart contracts in Uniswap V2 manage the liquidity pools, dictate the rules for token swapping, and ensure that trades are executed according to the protocol's algorithm, often referred to as the Constant Product Market Maker model.

### The Constant Product Formula

The Uniswap V2 smart contract uses this formula: x * y = k, where x and y represent the quantity of the two tokens in the liquidity pool, and k is a constant. This formula maintains the pool's total liquidity while allowing the token prices to fluctuate based on trading activity.

Code Example: Here's a simplified snippet of what a Uniswap V2 swap() function might look like (see the explanation below the code):

```solidity
function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external {
require(amount0Out > 0 || amount1Out > 0, "UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT");
(uint112 reserve0, uint112 reserve1,) = getReserves(); // fetches reserves of the pool
require(amount0Out < reserve0 && amount1Out < reserve1, "UniswapV2: INSUFFICIENT_LIQUIDITY");

    uint balance0;
    uint balance1;
    {
        uint amount0In = reserve0 - (balance0 = reserve0 - amount0Out);
        uint amount1In = reserve1 - (balance1 = reserve1 - amount1Out);
        require(amount0In > 0 || amount1In > 0, "UniswapV2: INSUFFICIENT_INPUT_AMOUNT");

        uint balanceAdjusted0 = balance0 * 1000 - amount0In * 3;
        uint balanceAdjusted1 = balance1 * 1000 - amount1In * 3;
        require(balanceAdjusted0 * balanceAdjusted1 >= uint(reserve0) * uint(reserve1) * (1000**2), "UniswapV2: K");

        // Emit the Swap event
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    _update(balance0, balance1, reserve0, reserve1);

    if (amount0Out > 0) _safeTransfer(token0, to, amount0Out);
    if (amount1Out > 0) _safeTransfer(token1, to, amount1Out);

    if (data.length > 0) {
        IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
    }
}
```

In this function:

* `amount0Out` and `amount1Out` are the amounts of each token that the caller wants to receive from the pool.

* The function first checks that the output amounts are positive and that the swap doesn't deplete the pool's reserves.

* It then calculates the input amounts (`amount0In` and `amount1In`) as the difference between the initial reserves and
the new balances after the swap.

* The contract ensures that the trade maintains the constant product invariant (k) after accounting for a 0.3% fee
(`balanceAdjusted0` and `balanceAdjusted1` calculations).

* The `_update` function is called to update the pool's reserves with the new balances.

* Tokens are transferred to the recipient's address `to`.

* If there is callback data (`data`), it calls the `uniswapV2Call` function on the recipient address, which can be used
for more complex interactions like flash swaps.

* The `Swap` event is emitted right after calculating the input and output amounts and before updating the reserves. The `Swap` event logs the sender, the amounts of tokens coming in and going out of the pool, and the recipient of the tokens.

This logic encapsulates the essence of a swap transaction in Uniswap V2, balancing the pool's reserves to maintain the constant product while facilitating token exchanges.

We will be mostly interested in `Swap` events to monitor the blockchain activity and run Reactive Contracts based on it. Since the code of the pool smart contract does not change, most of the information that is different for every transaction is being logged in the event. So let’s talk a bit more about the two types of events we’ll be most interested in: `Swap` and `Sync`.

## Events in Uniswap V2

### Swap

The `Swap` event is emitted every time a trade occurs in a Uniswap V2 pool. It provides vital information about the transaction, such as the number of tokens involved in the swap and the addresses of the trader and recipient.

Event structure example:

```solidity
event Swap(
address indexed sender,
uint amount0In,
uint amount1In,
uint amount0Out,
uint amount1Out,
address indexed to
);
```

In this event:

* `sender` is the address that initiated the swap.
* `amount0In` and `amount1In` are the amounts of the respective tokens that were sent to the pool.
* `amount0Out` and `amount1Out` are the amounts of the respective tokens that were sent from the pool.
* `to` is the address that receives the output tokens.

You can see this event in [the list of the events](https://etherscan.io/tx/0x7b969e8a74ae9891e322311ca5fe6e5d7bcb53ac3412b4189d84683961043503#eventlog) in this transaction on Etherscan.

### Sync

The `Sync` event is emitted whenever the reserves of a Uniswap V2 pool are updated. This event occurs after a swap when liquidity is added or removed, or when there's a direct token transfer into or out of the pool. The `Sync` event helps keep track of the pool's reserves current state.

Event Structure Example:

```solidity
event Sync(uint112 reserve0, uint112 reserve1);
```

In this event:

* `reserve0` and `reserve1` represent the updated reserves of the pool's two tokens.

The `Sync` event is critical for maintaining up-to-date information on the pool's liquidity, which in turn affects trading price and slippage. You can see this event in [the list of the events](https://etherscan.io/tx/0x7b969e8a74ae9891e322311ca5fe6e5d7bcb53ac3412b4189d84683961043503#eventlog) in this transaction on Etherscan.

## Conclusion

In this article, we’ve explored the fundamentals of Uniswap V2, a cornerstone of DeFi that facilitates automated trading through liquidity pools and smart contracts. Key takeaways include:

- **Uniswap V2 Pools:** These pools, consisting of two tokens, enable seamless trading and liquidity provisioning without traditional market makers. Each transaction is governed by the Constant Product Market Maker model, which maintains the balance of liquidity in the pool.

- **Constant Product Formula:** The formula (x * y = k) ensures that the product of the quantities of the two tokens remains constant, allowing for dynamic pricing based on trading activity.

- **Swap and Sync Events:** The `Swap` event provides detailed information about trades, including token amounts and addresses, while the `Sync` event keeps track of reserve updates. These events are crucial for monitoring and integrating Uniswap activity with Reactive Contracts.

- **Code Mechanics:** The provided code example illustrates the core functionality of the `swap` function in Uniswap V2, demonstrating how the contract maintains liquidity and ensures accurate token swaps.

For practical applications and further insights into integrating Uniswap V2 with your projects, explore our [use cases](../use-cases/index.md) and join our [Telegram](https://t.me/reactivedevs) group to engage with the community.

---
title: "Module 2: Intermediate - Building Blocks for Reactivity"
sidebar_position: 1
description: Learn the basics of DeFi with Uniswap V2 and Reactive Contracts. Discover how liquidity pools work and see RCs in action as they autonomously execute trades.
slug: /education/module-2
---

# Module 2: Intermediate - Building Blocks for Reactivity

# Overview

Welcome to Module 2: Intermediate - Building Blocks for Reactivity! In this module, we're diving into decentralized finance (DeFi), with a focus on understanding and applying Reactive Contracts (RCs).

[Lesson 6: Understanding Uniswap V2 Pools and Smart Contracts](./how-uniswap-works.md)

Gain an understanding of Uniswap V2, a key decentralized finance protocol. Learn how liquidity pools function and explore the smart contracts that drive Uniswap V2, enabling efficient and decentralized trading.

[Lesson 7: Implementing Basic Reactive Functions](./basic-reactive-functions.md)

Explore how Reactive Contracts (RCs) operate within the DeFi space. Understand how RCs can autonomously execute trades and respond to specific conditions, improving the capabilities of decentralized applications.

---
title: Glossary
sidebar_position: 4
description: A comprehensive blockchain and DeFi glossary for developers, traders, and builders joining Reactive Network. Learn essential Web3, EVM, cross-chain, and Reactive Contract concepts—from Airdrops and Finality to TPS, block time, and automated DeFi execution.
slug: glossary
hide_title: true
---

![Glossary Image](img/glossary.jpg)

## A

**Airdrop** – free tokens sent to eligible wallets. Projects use airdrops to attract users, reward early supporters, or bootstrap a community. Eligibility often depends on actions (e.g., using a protocol) or holding a token.

**APY (Annual Percentage Yield)** – estimated yearly return that includes compounding (earning “interest on interest”). In DeFi, APY can change frequently as rewards and usage fluctuate.

**Atomic Swap** – a trustless trade between two cryptocurrencies where the swap either completes fully or doesn’t happen at all (no partial fills, no counterparty risk), usually enforced by smart contract logic.

**Auto-Compounding** – automatically reinvesting earned rewards back into your position so your balance grows faster over time, without you manually claiming and re-depositing.

**AMMs (Automated Market Makers)** – DEX trading systems that use liquidity pools and a pricing formula instead of an order book. You trade against a pool, and the price adjusts as the pool balance changes.

## B

**Beacon Chain** – Ethereum’s proof-of-stake coordination layer introduced during the Ethereum 2.0 upgrade. It manages validators and consensus for the network.

**Block Time** – how often a chain produces new blocks (e.g., ~7 seconds). Shorter block time usually means faster “first confirmation,” but not always faster finality.

**Bridging** – moving tokens (or messages) from one blockchain to another using a bridge. Bridges are useful but can add risk because they rely on extra infrastructure.

**Burning (Token Burn)** – permanently removing tokens from circulation (sent to an unusable address or destroyed by protocol rules). Burns reduce supply and may affect token economics.

## C

**Cold Wallet** – a wallet whose private keys are stored offline (e.g., hardware wallet). Safer from online attacks, but less convenient for frequent transactions.

**Confirmation** – a transaction has been included in a block. More confirmations means more blocks were added after it, making it harder to reverse on chains with probabilistic finality.

**Consensus Algorithm** – the rules the network uses to agree on the “true” chain and validate blocks/transactions (e.g., PoS, PoW). Consensus is what lets thousands of nodes share one ledger state.

**Cross-chain Copy Trading** – automatically copying another trader’s actions across one or more chains (e.g., their swaps, opens/closes), so your wallet mirrors their strategy.

**Custodial Wallet** – a wallet where someone else (an exchange or provider) controls the private keys for you. Easier to use, but you rely on the custodian for access and security.

## D

**DAO Governance** – community decision-making using on-chain voting. Token holders (or members) vote on proposals like upgrades, spending, or parameter changes.

**dApp (Decentralized Application)** – an app whose core logic runs on smart contracts. The UI may look like a normal website, but actions are executed on-chain.

**DeFi (Decentralized Finance)** – financial services built with smart contracts (trading, lending, borrowing) that run without traditional intermediaries.

**Delegated Proof of Stake (DPoS)** – a PoS variant where token holders elect a smaller set of delegates/validators to produce blocks on behalf of the network.

**Destination Chain** – the chain where a transaction ultimately executes and changes state (where the “final action” happens).

**DEX Swaps** – exchanging one token for another on a decentralized exchange using smart contracts, usually via AMMs or on-chain order books.

## E

**Emitting Events** – smart contracts writing “event logs” that external apps can read. Events are often used for indexing, notifications, and triggering automation (they don’t directly change state by themselves).

**EOA (Externally Owned Account)** – a normal wallet account controlled by a private key (e.g., MetaMask). EOAs can sign transactions; smart contracts cannot sign on their own.

**ERC-20** – the common token standard on Ethereum/EVM chains. Most fungible tokens follow ERC-20 rules (balances, transfers, approvals).

**ERC-721** – the standard for NFTs (unique tokens). Each token ID represents a distinct asset.

**Event-Driven Execution** – contracts/app logic that reacts to events or data changes rather than a user manually clicking “execute”.

**Event Sources** – where events come from (e.g., transactions on an origin chain, specific contracts, or a monitored event stream).

**EVM Events** – event logs produced by EVM smart contracts. Wallets/indexers use them to track activity like transfers, swaps, and state-related notifications.

## F

**Fiat Gateway** – a service that lets you buy/sell crypto using traditional money (bank transfer, card, etc.), bridging fiat ↔ crypto.

**Finality** – the point at which a transaction can no longer be reverted. Some chains reach fast deterministic finality; others rely on “more confirmations” to increase confidence.

**Flash Loan** – a loan that must be borrowed and repaid within the same transaction. If repayment fails, the whole transaction reverts. Used for arbitrage and complex DeFi operations.

**Fork** – a protocol change. A soft fork is backward-compatible; a hard fork creates a split where older nodes can’t follow the new rules.

**Fungibility** – every unit is interchangeable (1 USDC ≈ any other 1 USDC). NFTs are non-fungible because each item is unique.

## G

**Gas** – the fee unit for computation on EVM chains. You pay gas to run transactions; complex actions cost more.

**Gauge Voting** – voting that directs incentives (often reward emissions) to specific pools/strategies, commonly used in DeFi to influence where liquidity goes.

**Genesis Block** – the first block of a blockchain (block 0), from which all later blocks follow.

## H

**Hash** – a “digital fingerprint” of data. A small change in input produces a very different output, which makes hashes useful for integrity and linking blocks.

**Hot Wallet** – a wallet whose keys are on an internet-connected device. Convenient, but higher exposure to phishing/malware than cold storage.

## I

**Initial Coin Offering (ICO)** – fundraising by selling a new token to early backers (historically common; now often replaced by other launch models).

**Interoperability** – the ability for chains/apps to communicate or move assets/messages across networks.

**Inversion-of-Control** – in Reactive Contracts, execution is triggered by the system when relevant events happen, rather than users manually calling functions at the right moment.

**Immutable** – once data is finalized on-chain, it can’t be changed without extraordinary network-level intervention.

## K

**Keypair** – your public key is like an address identifier; your private key is the secret that signs transactions. Whoever controls the private key controls the funds.

**KYC (Know Your Customer)** – identity verification required by many regulated services (exchanges, fiat gateways) to comply with AML laws.

## L

**L1 (Layer One)** – the base blockchain that provides security and final settlement (e.g., Ethereum, Solana).

**L2 (Layer Two)** – a scaling layer that processes transactions off the L1 main path and settles results back to L1 (often cheaper/faster).

**Latency** – how long it takes from submitting an action to seeing it executed/confirmed.

**Liquidation Protection** – features designed to reduce the chance a leveraged/collateralized position gets liquidated (varies by protocol).

**Liquidity Pools** – shared token reserves that enable trading/lending. Liquidity providers deposit assets and earn fees/rewards, but take risks (e.g., price movement).

## M

**Merkle Root** – a single hash that represents a whole set of data (like all transactions in a block). It lets nodes verify inclusion efficiently.

**Merkle Tree** – a structure that organizes hashes so you can prove a piece of data is included without downloading everything.

**Multisig Protocol** – a wallet/control scheme requiring multiple approvals (e.g., 2-of-3 signatures) before funds move.

## N 

**Node** – a computer running blockchain software that helps validate, relay, and store chain data.

**Nonce** – a value used once. In PoW it’s adjusted to find a valid block hash; in accounts it can prevent replay and enforce transaction ordering.

## O

**Oracles** – systems that bring external data (prices, outcomes, timestamps) on-chain so smart contracts can react to real-world information.

**Origin Chain** – the chain where the relevant events are observed/emitted before being processed for Reactive Contract execution.

## P

**Proof of Authority (PoA)** – a consensus model where a known set of validators produces blocks. Efficient, but more centralized than open validator sets.

**Proof of Stake (PoS)** – consensus where validators stake tokens to participate and can be penalized for malicious behavior.

## R

**ReacDeFi** – Reactive Network’s dApp for automated trade management (e.g., stop-loss and take-profit), with upcoming liquidation protection — built to execute strategies via on-chain event-centric logic rather than bots.

**ReactVM** – Reactive Network’s execution environment for Reactive Contracts, designed for high-throughput parallel processing while preserving correct ordering where needed.

**Reactive Network** – a blockchain layer designed for event-centric smart contracts that execute automatically based on on-chain events (including cross-chain), reducing reliance on off-chain bots and centralized automation.

**Reactive Contract** – a smart contract that watches for specified events and executes automatically when conditions are met (e.g., “if price hits X, do Y”).

**Reactivity** – the property of a system where actions are triggered by incoming events/data streams instead of manual user transactions.

**Rollups** – L2 systems that batch many transactions and post compressed proofs/data to an L1 to reduce cost and increase throughput.

## S

**Self-Rebalancing Liquidity Pools** – pools that automatically adjust allocations/weights according to predefined rules, rather than relying on manual rebalancing.

**Sharding** – a scalability technique that splits a blockchain into multiple shards, each handling part of the total workload. It increases throughput and reduces congestion, but adds complexity around security and cross-shard communication.

**Sidechain** – a separate blockchain connected to a main chain, often with different rules or performance characteristics, and a bridge for moving assets between them. Sidechains can offer cheaper or faster transactions, but usually rely on their own security assumptions rather than the main chain’s.

**Stateful** – a contract or system that stores data over time and updates it as transactions/events occur (as opposed to stateless computation).

**Stop Order** – an order that triggers when price reaches a set level, typically to limit losses or enter a position.

**Stop Price** – the price level that triggers the stop order.

## T

**Tokenomics** – how a token’s supply, distribution, incentives, and utility are designed (and how those choices affect behavior and value).

**TPS (Transactions Per Second)** – a rough throughput metric. TPS comparisons can be misleading unless you also consider transaction type, finality, and fees.

**Trading Pools** – pooled liquidity used to enable trading and price discovery on DEXs.

**Trustlessness** – the idea that you don’t need to trust a person or company because rules are enforced by code and consensus (though you still trust assumptions like contract correctness).

## U

**Uniswap** – a leading decentralized exchange (DEX) on Ethereum where users swap tokens directly from their wallets. Instead of matching buyers and sellers in an order book, Uniswap typically uses liquidity pools and AMM pricing.

## V

**Validator** – a network participant that proposes and verifies blocks. In PoS systems, validators lock up (“stake”) tokens to earn rewards and can be penalized (slashed) for malicious behavior or going offline.

## W

**Whale Moves** – very large trades or transfers made by “whales” (wallets with substantial holdings). These transactions can move prices, shift liquidity, or signal market sentiment—though not every large transfer means a trade happened.

**Wrapped Tokens** – tokens that track the value of an asset from another chain so it can be used in a new ecosystem (e.g., BTC represented as WBTC on Ethereum). Wrapped tokens typically rely on custody or protocol mechanisms to keep the “wrapped” token redeemable for the original asset.

## Y

**Yield Farming** – earning rewards by putting tokens to work in DeFi (e.g., providing liquidity, lending, staking). Returns can be high but variable, and strategies carry risks such as smart contract bugs, price volatility, and impermanent loss.

## Z 

**Zero-Knowledge Proof (ZKP)** – a cryptographic proof that lets you demonstrate something is true (e.g., “I meet condition X”) without revealing the underlying data (e.g., the exact balance or identity).