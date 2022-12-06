import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('findFirst', () => {
  it('findFirst', async () => {
    type X = {
      readonly a: number
      readonly b: number
    }

    const isA1 = (x: X) => x.a === 1

    await pipe(
      stream.fromArray([
        { a: 1, b: 1 },
        { a: 1, b: 2 }
      ]),
      stream.findFirst(isA1),
      task.map((res) => assert.deepStrictEqual(option.some({ a: 1, b: 1 }), res))
    )()
  })
})
