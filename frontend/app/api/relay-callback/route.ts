import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In real scenario: Reactive Callback Proxy monitors for Callback events
    // and automatically relays them to Unichain via their relay network
    // This simulates that relay happening
    await new Promise(resolve => setTimeout(resolve, 600))

    return NextResponse.json({
      txHash: '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      status: 'relayed',
      targetChain: 1301,
      targetChainName: 'Unichain Sepolia',
      targetContract: '0x' + Array(40).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to relay callback' },
      { status: 500 }
    )
  }
}
