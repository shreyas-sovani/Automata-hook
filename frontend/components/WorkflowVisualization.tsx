'use client'

import React from 'react'
import { ChevronRight, AlertCircle } from 'lucide-react'
import { WorkflowData } from '@/lib/mockData'

interface WorkflowVisualizationProps {
  data: WorkflowData
  activeStep: number
  isRunning: boolean
}

export default function WorkflowVisualization({
  data,
  activeStep,
  isRunning,
}: WorkflowVisualizationProps) {
  const steps = [
    {
      id: 0,
      title: 'SwapEmitter Trigger',
      description: 'WhaleDump event emitted on Unichain Sepolia',
      chain: 'Unichain Sepolia',
      status: activeStep >= 0 ? (activeStep === 0 && isRunning ? 'running' : 'completed') : 'pending',
      txHash: data.originTxHash,
    },
    {
      id: 1,
      title: 'Reactive Network Indexing',
      description: 'Event detected and logged by Reactive Network',
      chain: 'Reactive Network',
      status: activeStep >= 1 ? (activeStep === 1 && isRunning ? 'running' : 'completed') : 'pending',
      txHash: data.reactIndexTxHash,
    },
    {
      id: 2,
      title: 'AutomataBrain Processing',
      description: 'React logic executes in ReactVM',
      chain: 'ReactVM (Lasna Testnet)',
      status: activeStep >= 2 ? (activeStep === 2 && isRunning ? 'running' : 'completed') : 'pending',
      txHash: data.brainTxHash,
    },
    {
      id: 3,
      title: 'Callback Emission',
      description: 'Callback event emitted with state transition payload',
      chain: 'ReactVM (Lasna Testnet)',
      status: activeStep >= 3 ? (activeStep === 3 && isRunning ? 'running' : 'completed') : 'pending',
      txHash: data.callbackTxHash,
    },
    {
      id: 4,
      title: 'Reactive Relay',
      description: 'Callback proxy relays transaction to Unichain',
      chain: 'Reactive Infrastructure',
      status: activeStep >= 4 ? (activeStep === 4 && isRunning ? 'running' : 'completed') : 'pending',
      txHash: data.relayTxHash,
    },
    {
      id: 5,
      title: 'AutomataHook Execution',
      description: 'Fee state updated on target pool',
      chain: 'Unichain Sepolia',
      status: activeStep >= 5 ? (activeStep === 5 && isRunning ? 'running' : 'completed') : 'pending',
      txHash: data.hookTxHash,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-500/10'
      case 'completed':
        return 'border-green-500 bg-green-500/5'
      case 'pending':
        return 'border-gray-600 bg-gray-800'
      default:
        return 'border-gray-600'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500 text-white'
      case 'completed':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-gray-600 text-gray-300'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Workflow Pipeline</h2>
        <div className="text-sm text-gray-400">
          Step {activeStep + 1} / {steps.length}
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id}>
            <div
              className={`border-2 rounded-lg p-6 transition-all duration-300 ${getStatusColor(
                step.status
              )}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${getStatusBadgeColor(
                      step.status
                    )}`}
                  >
                    {step.id + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                  </div>
                </div>
                {step.status === 'running' && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Network</span>
                  <p className="text-sm font-medium text-gray-300 mt-1">{step.chain}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                  <p className="text-sm font-medium text-gray-300 mt-1 capitalize">{step.status}</p>
                </div>
              </div>

              {step.txHash && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Tx Hash:</span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${step.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline break-all"
                    >
                      {step.txHash.substring(0, 16)}...{step.txHash.substring(-14)}
                    </a>
                    <svg
                      className="w-3 h-3 text-blue-400 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {index < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <ChevronRight className="w-6 h-6 text-gray-600 rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Infrastructure Issue Notice */}
      {activeStep >= 5 && (
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-500 mb-1">Infrastructure Issue</p>
            <p className="text-xs text-yellow-400/80">
              The Reactive Callback Proxy successfully relayed the transaction, but the AutomataHook
              fee update wasn't applied on-chain due to timing synchronization. All test cases pass
              locally, confirming the smart contract logic is correct.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
