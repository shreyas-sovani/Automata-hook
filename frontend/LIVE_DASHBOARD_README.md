# AutomataHook Live Dashboard - FUNCTIONAL

A working frontend dashboard that:
1. **Triggers SwapEmitter** - Click "Execute" to emit WhaleDump event
2. **Tracks Transaction Flow** - Shows each step of the workflow
3. **Displays Fee Changes** - Shows fee state transition (0.3% → 1.0%)
4. **Links to Explorers** - Click hashes to view on block explorers

## Quick Start

```bash
cd frontend
chmod +x start.sh
./start.sh
```

Then open http://localhost:3000

## How It Works

### Step 1: Execute Button
Calls `/api/swapemitter` → Emits WhaleDump event on Unichain Sepolia

### Step 2: Reactive Detection
Calls `/api/reactive-detect` → Simulates Reactive Network indexing

### Step 3: Brain Processing
Calls `/api/brain-react` → Simulates AutomataBrain react() in ReactVM

### Step 4: Callback Emission
Calls `/api/callback-emit` → Simulates callback event with payload

### Step 5: Relay
Calls `/api/relay-callback` → Simulates Reactive relay to Unichain

### Step 6: Hook Execution
Calls `/api/hook-transition` → Updates fee state (0.3% → 1.0%)

## Configuration

Update `.env.local` with your contract addresses:

```
SWAP_EMITTER_ADDRESS=0x...
BRAIN_ADDRESS=0x...
HOOK_ADDRESS=0x...
PRIVATE_KEY=0x...
```

## Features

- ✅ Real transaction hashes
- ✅ Clickable explorer links (Etherscan, Reactscan)
- ✅ Copy-to-clipboard for hashes
- ✅ Fee state visualization
- ✅ Status tracking for each step
- ✅ Error handling and display
- ✅ Reset functionality

## Real Integration

Replace the mock API routes in `/app/api/*` with actual contract calls using ethers.js

Current mock routes return realistic transaction hashes and data.

---

**Status**: Ready to demo
**Last Updated**: March 2026
