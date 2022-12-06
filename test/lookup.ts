import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('lookup', () => {
  it('lookup', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.lookup(1),
      task.map((res) => assert.deepStrictEqual(option.some(2), res))
    )()

    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.lookup(3),
      task.map((res) => assert.deepStrictEqual(option.none, res))
    )()
  })
})
