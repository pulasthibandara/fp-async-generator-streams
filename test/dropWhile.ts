import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('dropWhile', () => {
  it('dropWhile', async () => {
    await pipe(
      [1, 3, 2, 4, 5],
      stream.fromArray,
      stream.dropWhile((n: number) => n % 2 == 1),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [2, 4, 5]))
    )()
  })
})
