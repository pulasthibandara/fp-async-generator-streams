import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('init', () => {
  it('init', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.init,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2]))
    )()

    await pipe(
      stream.fromArray([]),
      stream.init,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()
  })
})
