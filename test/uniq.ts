import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, number } from 'fp-ts'
import { stream } from '../src'

describe('uniq', () => {
  it('uniq', async () => {
    await pipe(
      stream.fromArray([1, 2, 1]),
      stream.uniq(number.Eq),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual([1, 2], res))
    )()
  })
})
