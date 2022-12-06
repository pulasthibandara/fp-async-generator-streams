import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('chunksOf', () => {
  it('chunksOf', async () => {
    const test = pipe(
      stream.fromArray([1, 2, 3, 4, 5]),
      stream.chunksOf(2),
      stream.toArray,
      task.map((chunks) => assert.deepStrictEqual(chunks, [[1, 2], [3, 4], [5]]))
    )

    await test()
  })
})
