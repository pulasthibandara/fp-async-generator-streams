import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('zipWith', () => {
  it('zipWith', async () => {
    await pipe(
      stream.zipWith(stream.fromArray([1, 2, 3]), stream.fromArray(['a', 'b', 'c', 'd']), (a, b) => a + b),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, ['1a', '2b', '3c']))
    )()
  })
})
