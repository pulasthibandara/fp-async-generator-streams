import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task, array } from 'fp-ts'

describe('splitAt', () => {
  it('splitAt', async () => {
    await pipe(
      stream.fromArray([1, 2, 3, 4, 5]),
      stream.splitAt(2),
      array.traverse(task.task)(stream.toArray),
      task.map((split) =>
        assert.deepStrictEqual(split, [
          [1, 2],
          [3, 4, 5]
        ])
      )
    )()
  })
})
