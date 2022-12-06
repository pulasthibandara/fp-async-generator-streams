import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('replicate', () => {
  it('replicate', async () => {
    await pipe(
      stream.replicate(3, 'a'),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, ['a', 'a', 'a']))
    )()

    await pipe(
      stream.replicate(-3, 'a'),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, []))
    )()

    await pipe(
      stream.replicate(2.985647, 'a'),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, ['a', 'a']))
    )()
  })
})
