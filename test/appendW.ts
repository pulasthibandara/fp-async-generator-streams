import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('appendW', () => {
  it('appendW', async () => {
    await pipe(
      stream.fromArray([0, 1, 2, 3]),
      stream.appendW('four'),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 'four']))
    )()
  })
})
