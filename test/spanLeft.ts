import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, apply } from 'fp-ts'
import { stream } from '../src'

describe('spanLeft', () => {
  it('spanLeft', async () => {
    const isOdd = (n: number) => n % 2 === 1

    await pipe(
      [1, 3, 2, 4, 5],
      stream.fromArray,
      stream.spanLeft(isOdd),
      ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
      task.map((res) => assert.deepStrictEqual(res, { init: [1, 3], rest: [2, 4, 5] }))
    )()

    await pipe(
      [0, 2, 4, 5],
      stream.fromArray,
      stream.spanLeft(isOdd),
      ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
      task.map((res) => assert.deepStrictEqual(res, { init: [], rest: [0, 2, 4, 5] }))
    )()

    await pipe(
      [1, 3, 5],
      stream.fromArray,
      stream.spanLeft(isOdd),
      ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
      task.map((res) => assert.deepStrictEqual(res, { init: [1, 3, 5], rest: [] }))
    )()
  })
})
