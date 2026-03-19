# 🚀 Real Transaction Pipeline - Step-by-Step Instructions

## SETUP COMPLETE ✅

Frontend running at: **http://localhost:3001**

All real contracts configured and ready to execute real transactions.

---

## STEP 1: CALL SWAPEMITTER 🎬

### Option A: Using Frontend Dashboard (Easiest)
1. Open http://localhost:3001 in your browser
2. Click the big **"Execute"** button
3. Watch as Transaction Hash appears in Step 1
4. **Copy the SwapEmitter TX hash**

### Option B: Using Command Line
```bash
node /Users/shreyas/Desktop/automatahook/DEMO_RUN.mjs
```

---

## STEP 2: MONITOR LASNA SCAN 🔍

After SwapEmitter transaction is confirmed:

1. Open **https://lasna.reactscan.net** in a new tab
2. Go to AutomataBrain contract: **0x3ba6A0FBbFE48634B5bE6d120591ea5E42fBD90E**
3. Look at **Events** tab
4. You should see:
   - ✅ **Callback event emitted** (your SwapEmitter TX triggered this)
   - Contains encoded payload for AutomataHook

### What's Happening:
- Reactive Network detected your SwapEmitter event
- AutomataBrain.react() was automatically triggered (via ReactVM)
- AutomataBrain emitted a **Callback event** with data for the Hook
- Callback is being relayed to Unichain by Reactive infrastructure

---

## STEP 3: CONTINUE PIPELINE 📊

Back to frontend or using command:

1. If using **Dashboard**: Click **Execute** again to run remaining steps
   - Step 3: AutomataBrain processes (Reactive Lasna)
   - Step 4: Callback emission
   - Step 5: Relay to Unichain
   - Step 6: Hook fee update

2. If using **Command**: Script shows all transactions automatically

---

## STEP 4: VERIFY FEE CHANGE ⚡

When Step 6 completes (AutomataHook transaction):

### Frontend Shows:
```
BEFORE:  3000 (0.3%)  ← Original fee
AFTER:   10000 (1.0%)  ← New risk-off fee ✨
```

### Verify on Unichain Etherscan:
1. Search TX hash from Step 6
2. See **transitionState** function call
3. Fee parameter changed: `3000` → `10000`

---

## REAL TRANSACTIONS HAPPENING: 🔗

| Step | Contract | Network | TX Hash | Explorer |
|------|----------|---------|---------|----------|
| 1 | SwapEmitter | Unichain Sepolia | Click dashboard | Etherscan |
| 2 | Reactive | Reactive Lasna | Auto-detected | Reactscan |
| 3 | AutomataBrain | Reactive Lasna | Dashboard Step 3 | Reactscan |
| 4 | Callback Proxy | Reactive Lasna | Dashboard Step 4 | Reactscan |
| 5 | Relay | Cross-chain | Dashboard Step 5 | Etherscan |
| 6 | AutomataHook | Unichain Sepolia | Dashboard Step 6 | Etherscan |

---

## EXPLORERS TO USE:

- **Unichain Sepolia**: https://sepolia.etherscan.io/
  - For SwapEmitter, AutomataHook, Relay
  
- **Reactive Lasna**: https://lasna.reactscan.net/
  - For AutomataBrain, Callback events

---

## KEY CONTRACTS:

```
SwapEmitter:      0xDd11D341aF6412e96327970F0D2780c8BE14CC2F (Unichain)
AutomataBrain:    0x3ba6A0FBbFE48634B5bE6d120591ea5E42fBD90E (Reactive)
AutomataHook:     0xc77477653aB522348d6806780c2aaFc0CE33053E (Unichain)
```

---

## WORKFLOW FLOW:

```
SwapEmitter (Unichain)
    ↓ emits event
Reactive Network (indexed)
    ↓ triggers
AutomataBrain (ReactVM)
    ↓ processes, emits Callback
Callback Event (Reactive)
    ↓ relayed by
Reactive Proxy
    ↓ sends to
AutomataHook (Unichain)
    ↓ executes
Fee Update: 3000 → 10000 bps ✨
```

---

## READY? GO! 🚀

**Click Execute on http://localhost:3001 NOW!**

Then open Lasna Scan to see the Callback happening in real-time.
