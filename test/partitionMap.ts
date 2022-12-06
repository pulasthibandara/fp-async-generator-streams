import * as assert from 'assert'
import { stream } from '../src'
import { separated, either, apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('partitionMap', () => {
  it('partitionMap', async () => {
    const upperIfString = <B>(x: B): either.Either<B, string> =>
      typeof x === 'string' ? either.right(x.toUpperCase()) : either.left(x)

    await pipe(
      [-2, 'hello', 6, 7, 'world'],
      stream.fromArray,
      stream.partitionMap(upperIfString),
      separated.bimap(stream.toArray, stream.toArray),
      ({ left, right }) => ({ left, right }),
      apply.sequenceS(task.task),
      task.map((res) =>
        assert.deepStrictEqual(res, {
          left: [-2, 6, 7],
          right: ['HELLO', 'WORLD']
        })
      )
    )()
  })
})
