import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('last', () => {
  it('last', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.last,
      task.map((res) => assert.deepStrictEqual(option.some(3), res))
    )()

    await pipe(
      stream.fromArray([]),
      stream.last,
      task.map((res) => assert.deepStrictEqual(option.none, res))
    )()
  })
})
