import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('takeWhile', () => {
  it('takeWhile', async () => {
    await pipe(
      [2, 4, 3, 6],
      stream.fromArray,
      stream.takeWhile((n: number) => n % 2 == 0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [2, 4]))
    )()
  })
})
