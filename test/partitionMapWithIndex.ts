import * as assert from 'assert'
import { stream } from '../src'
import { separated, either, apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('partitionMapWithIndex', () => {
  it('partitionMapWithIndex', async () => {
    const upperIfStringBefore3 = <B>(index: number, x: B): either.Either<B, string> =>
      index < 3 && typeof x === 'string' ? either.right(x.toUpperCase()) : either.left(x)

    await pipe(
      [-2, 'hello', 6, 7, 'world'],
      stream.fromArray,
      stream.partitionMapWithIndex(upperIfStringBefore3),
      separated.bimap(stream.toArray, stream.toArray),
      ({ left, right }) => ({ left, right }),
      apply.sequenceS(task.task),
      task.map((res) =>
        assert.deepStrictEqual(res, {
          left: [-2, 6, 7, 'world'],
          right: ['HELLO']
        })
      )
    )()
  })
})
