import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('length', () => {
  it('length', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.length,
      task.map((res) => assert.deepStrictEqual(3, res))
    )()

    await pipe(
      stream.fromArray([]),
      stream.length,
      task.map((res) => assert.deepStrictEqual(0, res))
    )()
  })
})
