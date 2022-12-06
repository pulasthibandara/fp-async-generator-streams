import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task, string } from 'fp-ts'

describe('fromPredicate', () => {
  it('fromPredicate', async () => {
    await pipe(
      'a',
      stream.fromPredicate(string.isString),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['a']))
    )()

    await pipe(
      7,
      stream.fromPredicate(string.isString),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()

    await pipe(
      7,
      stream.fromPredicate((x) => x > 0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [7]))
    )()

    await pipe(
      -3,
      stream.fromPredicate((x) => x > 0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()
  })
})
