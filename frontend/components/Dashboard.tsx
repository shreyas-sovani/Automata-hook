'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight, Zap, Target, Check, AlertCircle, ExternalLink, PlayCircle, RotateCcw } from 'lucide-react'
import WorkflowVisualization from './WorkflowVisualization'
import TransactionTracker from './TransactionTracker'
import StateVisualization from './StateVisualization'
import { generateMockData, WorkflowData } from '@/lib/mockData'

export default function Dashboard() {
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [simulationSpeed, setSimulationSpeed] = useState(1)

  useEffect(() => {
    setWorkflowData(generateMockData())
  }, [])

  const handleRunSimulation = () => {
    if (isRunning) {
      setIsRunning(false)
    } else {
      setIsRunning(true)
      setActiveStep(0)
      runSimulation()
    }
  }

  const runSimulation = () => {
    let step = 0
    const interval = setInterval(() => {
      if (step < 6) {
        setActiveStep(step)
        step++
      } else {
        setIsRunning(false)
        clearInterval(interval)
      }
    }, 3000 / simulationSpeed)

    return () => clearInterval(interval)
  }

  const handleReset = () => {
    setActiveStep(0)
    setIsRunning(false)
    setWorkflowData(generateMockData())
  }

  if (!workflowData) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AutomataHook
                </h1>
                <p className="text-sm text-gray-400">Reactive Network Workflow Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRunSimulation}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isRunning
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                {isRunning ? 'Stop' : 'Run Simulation'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Speed Control */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-400">Simulation Speed:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-blue-400 font-medium">{simulationSpeed}x</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Workflow */}
          <div className="lg:col-span-2 space-y-8">
            <WorkflowVisualization
              data={workflowData}
              activeStep={activeStep}
              isRunning={isRunning}
            />
            <StateVisualization data={workflowData} activeStep={activeStep} />
          </div>

          {/* Side Panel - Transactions */}
          <div className="space-y-8">
            <TransactionTracker data={workflowData} activeStep={activeStep} />

            {/* Network Status */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                Network Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Origin Chain:</span>
                  <span className="text-green-400 font-medium">Unichain Sepolia</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Reactive Chain:</span>
                  <span className="text-blue-400 font-medium">Lasna Testnet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Legend</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Active/Current</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Completed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <span className="text-gray-300">Pending</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <span className="text-gray-300">Infrastructure Issue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
