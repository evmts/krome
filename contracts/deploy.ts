/**
 * Deploys BankV1 with viem, using the bytecode Tevm compiled from the
 * `.sol` import. This is the JS alternative to
 * contracts/script/DeployBankV1.s.sol.
 *
 *   anvil &
 *   pnpm contracts:deploy                       # defaults to http://127.0.0.1:8545
 *   RPC_URL=... PRIVATE_KEY=0x... pnpm contracts:deploy
 *
 * The default key is Anvil's first dev account; never use it on a real network.
 */
import { BankV1 } from './BankV1.s.sol'
import { createWalletClient, createPublicClient, http, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'

const ANVIL_KEY_0 = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export async function deployBankV1(rpcUrl: string, privateKey: Hex) {
  const transport = http(rpcUrl)
  const account = privateKeyToAccount(privateKey)
  const wallet = createWalletClient({ account, chain: foundry, transport })
  const pub = createPublicClient({ chain: foundry, transport })

  // `deploy()` returns `{ abi, bytecode, args }`, the shape viem expects.
  const hash = await wallet.deployContract(BankV1.deploy())
  const receipt = await pub.waitForTransactionReceipt({ hash })
  if (!receipt.contractAddress) throw new Error(`Deployment failed: ${hash}`)
  return receipt.contractAddress
}

if (process.env.KROME_DEPLOY === '1') {
  const address = await deployBankV1(
    process.env.RPC_URL ?? 'http://127.0.0.1:8545',
    (process.env.PRIVATE_KEY ?? ANVIL_KEY_0) as Hex,
  )
  console.log(`BankV1 deployed at ${address}`)
}
