import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('findLastIndex', () => {
  it('findLastIndex', async () => {
    await pipe(
      stream.fromArray([1, 2, 3, 2, 4]),
      stream.findLastIndex((a) => a === 2),
      task.map((res) => assert.deepStrictEqual(option.some(3), res))
    )()

    await pipe(
      stream.fromArray([]),
      stream.findLastIndex((a) => a === 2),
      task.map((res) => assert.deepStrictEqual(option.none, res))
    )()
  })
})
