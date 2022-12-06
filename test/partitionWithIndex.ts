import * as assert from 'assert'
import { stream } from '../src'
import { separated } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task, apply } from 'fp-ts'

describe('partitionWithIndex', () => {
  it('partitionWithIndex', async () => {
    await pipe(
      [-2, 5, 6, 7],
      stream.fromArray,
      stream.partitionWithIndex((index, x: number) => index < 3 && x > 0),
      separated.bimap(stream.toArray, stream.toArray),
      ({ left, right }) => ({ left, right }),
      apply.sequenceS(task.task),
      task.map((res) =>
        assert.deepStrictEqual(res, {
          left: [-2, 7],
          right: [5, 6]
        })
      )
    )()
  })
})
