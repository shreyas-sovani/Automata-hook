import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

export async function POST() {
  try {
    const privateKey = process.env.PRIVATE_KEY
    const rpcUrl = process.env.NEXT_PUBLIC_UNICHAIN_SEPOLIA_RPC_URL
    const swapEmitterAddr = process.env.NEXT_PUBLIC_SWAP_EMITTER_ADDRESS

    if (!privateKey || !rpcUrl || !swapEmitterAddr) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      )
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)

    // SwapEmitter ABI - emitDump function
    const swapEmitterABI = [
      'function emitDump(address originPool, uint256 notionalVolume) external'
    ]

    const swapEmitter = new ethers.Contract(swapEmitterAddr, swapEmitterABI, wallet)

    // Generate random pool address
    const randomPool = ethers.getAddress(
      '0x' + Array(40).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
    )

    console.log('[SwapEmitter] Calling emitDump on', swapEmitterAddr)
    console.log('[SwapEmitter] Random pool:', randomPool)

    // Call emitDump
    const tx = await swapEmitter.emitDump(randomPool, ethers.parseUnits('100', 18))
    console.log('[SwapEmitter] Transaction sent:', tx.hash)

    // Wait for confirmation
    const receipt = await tx.wait()
    console.log('[SwapEmitter] Transaction confirmed:', receipt?.blockNumber)

    return NextResponse.json({
      txHash: tx.hash,
      status: 'success',
      chain: 1301,
      chainName: 'Unichain Sepolia',
      blockNumber: receipt?.blockNumber
    })
  } catch (error) {
    console.error('[SwapEmitter] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to emit SwapEmitter event' },
      { status: 500 }
    )
  }
}
