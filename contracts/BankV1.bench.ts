import { BankV1 } from './BankV1.s.sol'
import { createMemoryClient, parseEther } from 'tevm'
import { createAddress } from 'tevm/address'
import { bench, describe } from 'vitest'

const user = createAddress(420420).toString()

// Measures the in-browser EVM path Krome apps use for local simulation.
describe('BankV1 on a Tevm memory client', () => {
  bench('deploy + createAccount + deposit', async () => {
    const client = createMemoryClient()
    await client.tevmSetAccount({ address: user, balance: parseEther('10') })
    const { createdAddress } = await client.tevmDeploy(BankV1.deploy())
    await client.tevmMine()
    const bank = BankV1.withAddress(createdAddress!)
    await client.tevmContract({ ...bank.write.createAccount(1n), from: user, createTransaction: true })
    await client.tevmContract({
      ...bank.write.depositEther(user),
      value: parseEther('1'),
      from: user,
      createTransaction: true,
    })
    await client.tevmMine()
  }, { iterations: 20, time: 0 })
})
