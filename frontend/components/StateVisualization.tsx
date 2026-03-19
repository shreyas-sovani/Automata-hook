'use client'

import React from 'react'
import { Zap } from 'lucide-react'
import { WorkflowData } from '@/lib/mockData'

interface StateVisualizationProps {
  data: WorkflowData
  activeStep: number
}

export default function StateVisualization({ data, activeStep }: StateVisualizationProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Fee State */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold">Fee State</h3>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Before</span>
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-sm font-mono text-blue-400">Neutral (0.3%)</p>
              <p className="text-xs text-gray-500 mt-1">3000 bps</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="text-gray-500 text-2xl">→</div>
          </div>

          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">After</span>
            <div
              className={`mt-2 p-3 rounded transition-all duration-300 ${
                activeStep >= 5
                  ? 'bg-orange-500/20 border border-orange-500/50'
                  : 'bg-gray-700 border border-gray-600'
              }`}
            >
              <p
                className={`text-sm font-mono ${
                  activeStep >= 5 ? 'text-orange-400' : 'text-gray-400'
                }`}
              >
                {activeStep >= 5 ? 'Risk-Off (1.0%)' : 'Pending...'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activeStep >= 5 ? '10000 bps' : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pool Key Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Pool Configuration</h3>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Token 0:</span>
            <p className="text-gray-300 font-mono text-xs mt-1">{data.poolKey.currency0}</p>
          </div>
          <div>
            <span className="text-gray-500">Token 1:</span>
            <p className="text-gray-300 font-mono text-xs mt-1">{data.poolKey.currency1}</p>
          </div>
          <div>
            <span className="text-gray-500">Base Fee:</span>
            <p className="text-blue-400 font-semibold">{data.poolKey.fee} bps</p>
          </div>
          <div>
            <span className="text-gray-500">Tick Spacing:</span>
            <p className="text-blue-400 font-semibold">{data.poolKey.tickSpacing}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
