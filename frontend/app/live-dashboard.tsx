'use client'

import React, { useState, useEffect } from 'react'
import { Play, RotateCcw, ExternalLink, Copy, Check, AlertCircle, Zap } from 'lucide-react'

interface TxStep {
  name: string
  hash: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  chain: string
  timestamp: number
  explorerUrl: string
}

export default function Dashboard() {
  const [steps, setSteps] = useState<TxStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [feeState, setFeeState] = useState({ before: '3000 (0.3%)', after: null as string | null })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const runSwapEmitter = async () => {
    if (isRunning) return
    
    setIsRunning(true)
    setError(null)
    setSteps([])
    setFeeState({ before: '3000 (0.3%)', after: null })

    try {
      setLoading(true)
      
      // Step 1: Emit SwapEmitter event on Unichain Sepolia
      const step1Response = await fetch('/api/swapemitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!step1Response.ok) throw new Error('Failed to emit SwapEmitter event')
      
      const step1Data = await step1Response.json()
      const originTxHash = step1Data.txHash
      
      setSteps(prev => [...prev, {
        name: 'SwapEmitter Event Emitted',
        hash: originTxHash,
        status: 'completed',
        chain: 'Unichain Sepolia (1301)',
        timestamp: Date.now(),
        explorerUrl: `https://sepolia.etherscan.io/tx/${originTxHash}`
      }])

      // Step 2: Wait for Reactive to index
      const step2Response = await fetch('/api/reactive-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: originTxHash })
      })
      
      if (!step2Response.ok) throw new Error('Failed to detect in Reactive')
      
      const step2Data = await step2Response.json()
      const reactTxHash = step2Data.txHash

      setSteps(prev => [...prev, {
        name: 'Reactive Network Detected Event',
        hash: reactTxHash,
        status: 'completed',
        chain: 'Reactive Network',
        timestamp: Date.now(),
        explorerUrl: `https://lasna.reactscan.net/tx/${reactTxHash}`
      }])

      // Step 3: AutomataBrain processes (ReactVM)
      const step3Response = await fetch('/api/brain-react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originTxHash })
      })
      
      if (!step3Response.ok) throw new Error('AutomataBrain processing failed')
      
      const step3Data = await step3Response.json()
      const brainTxHash = step3Data.txHash

      setSteps(prev => [...prev, {
        name: 'AutomataBrain Processing (ReactVM)',
        hash: brainTxHash,
        status: 'completed',
        chain: 'Reactive ReactVM',
        timestamp: Date.now(),
        explorerUrl: `https://lasna.reactscan.net/tx/${brainTxHash}`
      }])

      // Step 4: Callback emitted
      const step4Response = await fetch('/api/callback-emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainTxHash })
      })
      
      if (!step4Response.ok) throw new Error('Callback emission failed')
      
      const step4Data = await step4Response.json()
      const callbackTxHash = step4Data.txHash

      setSteps(prev => [...prev, {
        name: 'Callback Emitted with Payload',
        hash: callbackTxHash,
        status: 'completed',
        chain: 'Reactive Network',
        timestamp: Date.now(),
        explorerUrl: `https://lasna.reactscan.net/tx/${callbackTxHash}`
      }])

      // Step 5: Reactive relay
      const step5Response = await fetch('/api/relay-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callbackTxHash })
      })
      
      if (!step5Response.ok) throw new Error('Relay failed')
      
      const step5Data = await step5Response.json()
      const relayTxHash = step5Data.txHash

      setSteps(prev => [...prev, {
        name: 'Callback Relayed to Unichain',
        hash: relayTxHash,
        status: 'completed',
        chain: 'Reactive Infrastructure',
        timestamp: Date.now(),
        explorerUrl: `https://sepolia.etherscan.io/tx/${relayTxHash}`
      }])

      // Step 6: Hook execution - fee state changes
      const step6Response = await fetch('/api/hook-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relayTxHash })
      })
      
      if (!step6Response.ok) throw new Error('Hook transition failed')
      
      const step6Data = await step6Response.json()
      const hookTxHash = step6Data.txHash
      const newFee = step6Data.newFee || '10000 (1.0%)'

      setSteps(prev => [...prev, {
        name: 'AutomataHook Fee State Updated',
        hash: hookTxHash,
        status: 'completed',
        chain: 'Unichain Sepolia (1301)',
        timestamp: Date.now(),
        explorerUrl: `https://sepolia.etherscan.io/tx/${hookTxHash}`
      }])

      // Fee state changed!
      setFeeState({ before: '3000 (0.3%)', after: newFee })

      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setLoading(false)
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setSteps([])
    setFeeState({ before: '3000 (0.3%)', after: null })
    setError(null)
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AutomataHook Live
                </h1>
                <p className="text-sm text-gray-400">Reactive Network Workflow Executor</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={runSwapEmitter}
                disabled={isRunning || loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  loading || isRunning
                    ? 'bg-blue-500/30 text-blue-300 cursor-not-allowed'
                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                }`}
              >
                <Play className="w-4 h-4" />
                {loading ? 'Processing...' : isRunning ? 'Running...' : 'Execute'}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workflow */}
          <div className="lg:col-span-2">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-500 mb-1">Error</p>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3 mb-8">
              {steps.length === 0 ? (
                <div className="p-12 text-center bg-gray-800 border border-gray-700 rounded-lg">
                  <Zap className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">Click Execute to start the workflow</p>
                </div>
              ) : (
                steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-gray-800 border border-green-500/50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{step.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{step.chain}</p>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono bg-gray-900 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis text-blue-300">
                        {step.hash.substring(0, 20)}...{step.hash.substring(-14)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(step.hash)}
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                        title="Copy hash"
                      >
                        {copiedHash === step.hash ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <a
                        href={step.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                        title="View on explorer"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-400" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Fee State Change */}
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Fee State Transition
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Before</span>
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <p className="text-sm font-mono text-blue-400">{feeState.before}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">After</span>
                  <div
                    className={`mt-2 p-3 rounded transition-all duration-300 ${
                      feeState.after
                        ? 'bg-orange-500/20 border border-orange-500/50'
                        : 'bg-gray-700 border border-gray-600'
                    }`}
                  >
                    <p
                      className={`text-sm font-mono ${
                        feeState.after ? 'text-orange-400' : 'text-gray-400'
                      }`}
                    >
                      {feeState.after || 'Pending...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Workflow Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Steps:</span>
                  <span className="text-green-400 font-medium">{steps.length}/6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    steps.length === 6 ? 'text-green-400' : loading ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {steps.length === 6 ? '✅ Complete' : loading ? '⏳ Processing' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Network Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Networks</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Origin:</span>
                  <p className="text-green-400 font-medium">Unichain Sepolia (1301)</p>
                </div>
                <div>
                  <span className="text-gray-500">Reactive:</span>
                  <p className="text-blue-400 font-medium">Lasna Testnet (5318007)</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-gray-300">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
