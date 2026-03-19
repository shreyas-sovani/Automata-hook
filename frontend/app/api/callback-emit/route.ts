import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In real scenario: Reactive Network automatically emits Callback event
    // when react() is called. This simulates that event being observed
    // We don't call anything here - just simulate the event
    await new Promise(resolve => setTimeout(resolve, 300))

    // Generate a mock callback payload
    const payload = '0x' + Array(256).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').substring(0, 512)

    return NextResponse.json({
      txHash: '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      status: 'callback_emitted',
      payload: payload,
      gasLimit: 200000,
      chain: 5318007,
      chainName: 'Reactive Lasna'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to emit callback' },
      { status: 500 }
    )
  }
}
