export interface PoolKey {
  currency0: string
  currency1: string
  fee: number
  tickSpacing: number
  hooks: string
}

export interface WorkflowData {
  originTxHash: string
  reactIndexTxHash: string
  brainTxHash: string
  callbackTxHash: string
  relayTxHash: string
  hookTxHash: string
  swapEmitterAddress: string
  brainAddress: string
  hookAddress: string
  reactiveProxyAddress: string
  poolKey: PoolKey
  timestamps: {
    emitted: number
    indexed: number
    brain: number
    callback: number
    relay: number
    hook: number
  }
}

function generateRandomHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

function generateRandomAddress(): string {
  return '0x' + Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

export function generateMockData(): WorkflowData {
  const now = Date.now()

  return {
    originTxHash: generateRandomHash(),
    reactIndexTxHash: generateRandomHash(),
    brainTxHash: generateRandomHash(),
    callbackTxHash: generateRandomHash(),
    relayTxHash: generateRandomHash(),
    hookTxHash: generateRandomHash(),
    swapEmitterAddress: '0x1234567890123456789012345678901234567890',
    brainAddress: '0xaBcDef0123456789aBcDef0123456789aBcDef01',
    hookAddress: '0x9876543210987654321098765432109876543210',
    reactiveProxyAddress: '0x0000000000000000000000000000000000fffFfF',
    poolKey: {
      currency0: '0x1111111111111111111111111111111111111111',
      currency1: '0x2222222222222222222222222222222222222222',
      fee: 3000,
      tickSpacing: 60,
      hooks: '0x9876543210987654321098765432109876543210',
    },
    timestamps: {
      emitted: now,
      indexed: now + 2000,
      brain: now + 4000,
      callback: now + 6000,
      relay: now + 8000,
      hook: now + 10000,
    },
  }
}
