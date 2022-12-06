import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('findFirstMapWithIndex', () => {
  it('findFirstMapWithIndex', async () => {
    await pipe(
      stream.fromArray([1, 2, 3, 2, 4]),
      stream.findFirstMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
      task.map((res) => assert.deepStrictEqual(option.some('1-2'), res))
    )()

    await pipe(
      stream.fromArray([]),
      stream.findFirstMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
      task.map((res) => assert.deepStrictEqual(option.none, res))
    )()
  })
})
