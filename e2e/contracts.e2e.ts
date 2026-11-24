import { spawn, execFile, type ChildProcess } from 'node:child_process'
import { promisify } from 'node:util'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'
import { BankV1 } from '../contracts/BankV1.s.sol'
import { deployBankV1 } from '../contracts/deploy.js'

// End-to-end: a real Anvil node, deployed with both viem (Tevm-compiled
// bytecode) and `forge script`. Override binaries with ANVIL_BIN / FORGE_BIN.
const ANVIL = process.env.ANVIL_BIN ?? 'anvil'
const FORGE = process.env.FORGE_BIN ?? 'forge'
const PORT = 8600 + Math.floor(Math.random() * 300)
const RPC = `http://127.0.0.1:${PORT}`
const KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

let anvil: ChildProcess
const transport = http(RPC)
const pub = createPublicClient({ chain: foundry, transport })
const wallet = createWalletClient({ account: privateKeyToAccount(KEY), chain: foundry, transport })

beforeAll(async () => {
  anvil = spawn(ANVIL, ['--port', String(PORT), '--silent'], { stdio: 'ignore' })
  for (let i = 0; i < 100; i++) {
    try {
      await pub.getChainId()
      return
    } catch {
      await new Promise((r) => setTimeout(r, 100))
    }
  }
  throw new Error(`anvil did not start on ${RPC}`)
})

afterAll(() => {
  anvil?.kill()
})

test('viem deploys Tevm-compiled BankV1 and it accepts deposits', async () => {
  const address = await deployBankV1(RPC, KEY)
  expect(await pub.getCode({ address })).toMatch(/^0x[0-9a-f]{100,}$/)

  const bank = BankV1.withAddress(address)
  await pub.waitForTransactionReceipt({ hash: await wallet.writeContract(bank.write.createAccount(7n)) })
  await pub.waitForTransactionReceipt({
    hash: await wallet.writeContract({ ...bank.write.depositEther(wallet.account.address), value: parseEther('1') }),
  })
  expect(await pub.getBalance({ address })).toBe(parseEther('1'))
})

test('forge script deploys BankV1', async () => {
  const { stdout } = await promisify(execFile)(
    FORGE,
    ['script', 'contracts/script/DeployBankV1.s.sol', '--rpc-url', RPC, '--broadcast', '--private-key', KEY],
    { env: { ...process.env, PRIVATE_KEY: KEY } },
  )
  expect(stdout).toMatch(/ONCHAIN EXECUTION COMPLETE & SUCCESSFUL/)
}, 120_000)
