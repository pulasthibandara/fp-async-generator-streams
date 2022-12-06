import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('scan', () => {
  it('scan', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.scan(10, (b, a: number) => b - a),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [10, 9, 7, 4]))
    )()
  })
})
