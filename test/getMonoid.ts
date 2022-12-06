import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, monoid } from 'fp-ts'
import { stream } from '../src'

describe('getMonoid', () => {
  it('getMonoid', async () => {
    const M = stream.getMonoid<number>()

    const test = pipe(
      monoid.concatAll(M)([stream.fromArray([1, 2]), stream.fromArray([2, 3])]),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 2, 3]))
    )

    await test()
  })
})
