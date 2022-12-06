import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('toArray', () => {
  it('toArray', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual([1, 2, 3], res))
    )()

    await pipe(
      stream.fromArray([]),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual([], res))
    )()
  })
})
