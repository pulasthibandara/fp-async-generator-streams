import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('prepend', () => {
  it('prepend', async () => {
    await pipe(
      stream.fromArray([1, 2, 3, 4]),
      stream.prepend(0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
    )()
  })
})
