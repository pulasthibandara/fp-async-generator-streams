import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('dropWhileIndex', () => {
  it('dropWhileIndex', async () => {
    await pipe(
      ['c', 'b', 'a', 'c', 'e'],
      stream.fromArray,
      stream.dropWhileIndex((idx: number, c: string) => c !== 'c' || idx < 3),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['c', 'e']))
    )()
  })
})
