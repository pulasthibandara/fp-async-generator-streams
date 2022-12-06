import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('isEmpty', () => {
  it('isEmpty', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.isEmpty,
      task.map((res) => assert.deepStrictEqual(res, false))
    )()

    await pipe(
      stream.fromArray([]),
      stream.isEmpty,
      task.map((res) => assert.deepStrictEqual(res, true))
    )()
  })
})
