import { NextRequest, NextResponse } from 'next/server'

function generateMockTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { txHash } = body

    // Simulate Reactive Network detecting the event
    // In real scenario: query Reactive RPC to verify event was indexed
    await new Promise(resolve => setTimeout(resolve, 400))

    return NextResponse.json({
      txHash: generateMockTxHash(),
      status: 'detected',
      originTxHash: txHash,
      chain: 5318007,
      chainName: 'Reactive Lasna'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to detect event on Reactive Network' },
      { status: 500 }
    )
  }
}
