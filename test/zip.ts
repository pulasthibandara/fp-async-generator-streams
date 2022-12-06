import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('zip', () => {
  it('zip', async () => {
    await pipe(
      stream.zip(stream.fromArray([1, 2, 3]), stream.fromArray(['a', 'b', 'c', 'd'])),
      stream.toArray,
      task.map((array) =>
        assert.deepStrictEqual(array, [
          [1, 'a'],
          [2, 'b'],
          [3, 'c']
        ])
      )
    )()
  })
})
