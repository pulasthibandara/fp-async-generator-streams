import * as assert from 'assert'
import { stream } from '../src'
import { separated, apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task, string } from 'fp-ts'

describe('partition', () => {
  it('partition', async () => {
    await pipe(
      ['a', 1, {}, 'b', 5],
      stream.fromArray,
      stream.partition(string.isString),
      separated.bimap(stream.toArray, stream.toArray),
      ({ left, right }) => ({ left, right }),
      apply.sequenceS(task.task),
      task.map((res) =>
        assert.deepStrictEqual(res, {
          left: [1, {}, 5],
          right: ['a', 'b']
        })
      )
    )()

    await pipe(
      [-3, 1, -2, 5],
      stream.fromArray,
      stream.partition((x: number) => x > 0),
      separated.bimap(stream.toArray, stream.toArray),
      ({ left, right }) => ({ left, right }),
      apply.sequenceS(task.task),
      task.map((res) =>
        assert.deepStrictEqual(res, {
          left: [-3, -2],
          right: [1, 5]
        })
      )
    )()
  })
})
