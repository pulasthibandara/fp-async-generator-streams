import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('fromRange', () => {
  it('fromRange', async () => {
    const test = pipe(
      stream.fromRange(0, 5),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
    )

    await test()
  })
})
