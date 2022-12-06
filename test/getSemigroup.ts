import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('getSemigroup', () => {
  it('getSemigroup', async () => {
    const S = stream.getSemigroup<number>()
    const test = pipe(
      S.concat(stream.fromArray([1, 2]), stream.fromArray([2, 3])),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 2, 3]))
    )

    await test()
  })
})
