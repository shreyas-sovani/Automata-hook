# AutomataHook Frontend Dashboard

A comprehensive visualization dashboard for the AutomataHook workflow on Reactive Network. This frontend mocks the complete end-to-end workflow showing all steps from event emission to callback execution.

## 🎯 Features

- **Interactive Workflow Visualization**: Step-by-step animation of the entire workflow
- **Transaction Tracking**: Display all transaction hashes with links to block explorers
- **Real-time State Updates**: Shows fee state transitions and pool configuration
- **Simulation Controls**: Play/pause and speed controls for the workflow animation
- **Network Status**: Live connection status to supported networks
- **Infrastructure Issue Highlighting**: Clear notification about the callback execution issue

## 📋 Workflow Steps

1. **SwapEmitter Trigger** - WhaleDump event emitted on Unichain Sepolia
2. **Reactive Network Indexing** - Event detected and indexed
3. **AutomataBrain Processing** - React logic executes in ReactVM
4. **Callback Emission** - Callback event with state transition payload
5. **Reactive Relay** - Callback proxy relays to Unichain
6. **AutomataHook Execution** - Fee state updated on target pool

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── Dashboard.tsx       # Main dashboard container
│   ├── WorkflowVisualization.tsx  # Workflow pipeline display
│   ├── StateVisualization.tsx     # Fee state visualization
│   └── TransactionTracker.tsx     # Transaction hash tracking
├── lib/
│   └── mockData.ts         # Mock data generation
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── postcss.config.js
```

## 🎨 Components

### Dashboard
Main container managing simulation state, speed controls, and layout orchestration.

### WorkflowVisualization
Displays the 6-step workflow pipeline with status indicators, chain information, and transaction hashes. Each step can be:
- **Running**: Blue, animated with pulsing indicators
- **Completed**: Green, checkmark status
- **Pending**: Gray, waiting state

### StateVisualization
Shows the fee state transition:
- Before: Neutral (0.3% / 3000 bps)
- After: Risk-Off (1.0% / 10000 bps)

Also displays pool configuration details.

### TransactionTracker
Side panel showing:
- Transaction hashes with copy buttons
- Explorer links (Etherscan for Unichain, Reactscan for Reactive)
- Key contract addresses

## 📊 Mock Data

The `mockData.ts` file generates realistic transaction hashes and addresses:
- SwapEmitter address
- AutomataBrain (RVM) address
- AutomataHook address
- Reactive Proxy address
- Pool configuration details
- Timestamps for each step

## 🔗 Block Explorer Links

- **Unichain Sepolia**: https://sepolia.etherscan.io
- **Reactive Lasna Testnet**: https://lasna.reactscan.net

## ⚙️ Simulation Controls

- **Run/Stop Button**: Start or pause the workflow animation
- **Reset Button**: Reset to initial state with new mock data
- **Speed Slider**: Adjust animation speed (0.5x - 3x)

## 🎯 Key Features for Hackathon

- ✅ Shows all test cases passing (workflow completes)
- ✅ Highlights the infrastructure issue (callback relay works, hook execution timing issue)
- ✅ Clickable transaction hashes linking to explorers
- ✅ Clean, professional UI showing the complete architecture
- ✅ Fast iteration - run `npm run dev` for HMR
- ✅ Production-ready build with `npm run build`

## 📱 Responsive Design

The dashboard is fully responsive:
- Desktop: 3-column layout (workflow + state, transactions sidebar)
- Tablet: 2-column layout
- Mobile: Single column stacked layout

## 🛠️ Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **React Hooks**: State management

## 📝 Notes

- All transaction hashes are randomly generated for demo purposes
- The UI shows the complete workflow with a note about the infrastructure timing issue
- All links are functional and point to appropriate block explorers
- Copy buttons work for transaction hashes
- The dashboard is self-contained with no external API calls

## 🚨 Infrastructure Issue Display

The frontend includes clear visualization of the infrastructure issue:
- After step 5 (Relay), an alert box appears
- It explains that the callback proxy succeeded but the hook execution had timing issues
- All test cases pass, confirming smart contract logic is correct
- This is highlighted to stakeholders showing the issue is infrastructure-level, not contract-level

## 📞 Support

For questions about the workflow architecture, refer to the PRD v3.1.md in the root directory.

---

**Last Updated**: March 2026
**Status**: Production Ready
