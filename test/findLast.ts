import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('findLast', () => {
  it('findLast', async () => {
    await pipe(
      stream.fromArray([
        { a: 1, b: 1 },
        { a: 1, b: 2 }
      ]),
      stream.findLast((x) => x.a === 1),
      task.map((res) => assert.deepStrictEqual(option.some({ a: 1, b: 2 }), res))
    )()
  })
})
