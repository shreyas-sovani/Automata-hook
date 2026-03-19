'use client'

import React from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { WorkflowData } from '@/lib/mockData'

interface TransactionTrackerProps {
  data: WorkflowData
  activeStep: number
}

export default function TransactionTracker({ data, activeStep }: TransactionTrackerProps) {
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null)

  const transactions = [
    {
      label: 'SwapEmitter Event',
      hash: data.originTxHash,
      explorer: `https://sepolia.etherscan.io/tx/${data.originTxHash}`,
      status: activeStep >= 0 ? 'completed' : 'pending',
    },
    {
      label: 'Brain React',
      hash: data.brainTxHash,
      explorer: `https://lasna.reactscan.net/tx/${data.brainTxHash}`,
      status: activeStep >= 2 ? 'completed' : 'pending',
    },
    {
      label: 'Callback Emitted',
      hash: data.callbackTxHash,
      explorer: `https://lasna.reactscan.net/tx/${data.callbackTxHash}`,
      status: activeStep >= 3 ? 'completed' : 'pending',
    },
    {
      label: 'Hook Transition',
      hash: data.hookTxHash,
      explorer: `https://sepolia.etherscan.io/tx/${data.hookTxHash}`,
      status: activeStep >= 5 ? 'completed' : 'pending',
    },
  ]

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Transaction Hashes</h3>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.hash}
            className={`p-3 rounded-lg border transition-all ${
              tx.status === 'completed'
                ? 'bg-green-500/5 border-green-500/30'
                : 'bg-gray-700 border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-gray-400">{tx.label}</span>
              {tx.status === 'completed' && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                  Done
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs font-mono bg-gray-900 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                {tx.hash.substring(0, 16)}...
              </code>
              <button
                onClick={() => copyToClipboard(tx.hash)}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Copy hash"
              >
                {copiedHash === tx.hash ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <a
                href={tx.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Key Addresses */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h4 className="text-sm font-semibold mb-3 text-gray-400">Key Addresses</h4>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-gray-500">SwapEmitter:</span>
            <code className="block bg-gray-900 p-2 rounded mt-1 font-mono text-gray-400 overflow-hidden text-ellipsis">
              {data.swapEmitterAddress}
            </code>
          </div>
          <div>
            <span className="text-gray-500">AutomataBrain (RVM):</span>
            <code className="block bg-gray-900 p-2 rounded mt-1 font-mono text-gray-400 overflow-hidden text-ellipsis">
              {data.brainAddress}
            </code>
          </div>
          <div>
            <span className="text-gray-500">AutomataHook:</span>
            <code className="block bg-gray-900 p-2 rounded mt-1 font-mono text-gray-400 overflow-hidden text-ellipsis">
              {data.hookAddress}
            </code>
          </div>
          <div>
            <span className="text-gray-500">Reactive Proxy:</span>
            <code className="block bg-gray-900 p-2 rounded mt-1 font-mono text-gray-400 overflow-hidden text-ellipsis">
              {data.reactiveProxyAddress}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
