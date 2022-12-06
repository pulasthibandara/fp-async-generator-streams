import * as assert from 'assert'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { stream } from '../src'

describe('chain', () => {
  it('chain', async () => {
    const f = (n: number) => stream.replicate(n, `${n}`)
    const test = await pipe(
      stream.fromArray([1, 2, 3]),
      stream.chain(f),
      stream.toArray,
      task.map((chained) => assert.deepStrictEqual(chained, ['1', '2', '2', '3', '3', '3']))
    )

    await test()
  })
})
