import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('flap', () => {
  it('flap', async () => {
    const funs = stream.fromArray([
      (n: number) => `Double: ${n * 2}`,
      (n: number) => `Triple: ${n * 3}`,
      (n: number) => `Square: ${n * n}`
    ])

    const test = await pipe(
      stream.flap(4)(funs),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['Double: 8', 'Triple: 12', 'Square: 16']))
    )

    await test()
  })
})
