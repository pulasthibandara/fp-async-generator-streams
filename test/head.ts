import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('head', () => {
  it('head', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.head,
      task.map((res) => assert.deepStrictEqual(option.some(1), res))
    )()

    await pipe(
      stream.fromArray([]),
      stream.head,
      task.map((res) => assert.deepStrictEqual(option.none, res))
    )()
  })
})
