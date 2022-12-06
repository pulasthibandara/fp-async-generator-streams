import * as assert from 'assert'
import * as fc from 'fast-check'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

const stream1To5 = stream.fromRange(1, 6)

describe('take', () => {
  it('takes first N elements of a stream of exact length', async () => {
    await pipe(
      stream1To5,
      stream.take(2),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2]))
    )()
  })

  it('takes first N elements of a stream of shorter length', async () => {
    await pipe(
      stream1To5,
      stream.take(7),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 3, 4, 5]))
    )()
  })

  it('takes zero elements', async () => {
    await pipe(
      stream1To5,
      stream.take(0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()
  })

  it('normalizes a negative length', async () => {
    await pipe(
      stream1To5,
      stream.take(-1),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()
  })

  it('takes first N elements from a stream longer than the taken length', async () => {
    const arbStreamLength = fc.integer({ min: 0, max: 10_000 })
    const streamLongerThanTaken = (take: number) => {
      const arbFirstNArray = fc.array(fc.integer(), { minLength: take, maxLength: take })
      const arbExtra = arbStreamLength
      const arbExtraArray = arbExtra.chain((extra) => fc.array(fc.integer(), { minLength: extra, maxLength: extra }))

      return fc
        .record({
          arbFirstNArray,
          arbExtraArray
        })
        .map(({ arbFirstNArray, arbExtraArray }) => ({
          expect: arbFirstNArray,
          integerStream: stream.fromArray([...arbFirstNArray, ...arbExtraArray])
        }))
    }

    const streamDefn = arbStreamLength.chain((take) =>
      fc.record({
        take: fc.constant(take),
        defn: streamLongerThanTaken(take)
      })
    )

    await fc.assert(
      fc.asyncProperty(streamDefn, async ({ take, defn: { expect, integerStream } }) => {
        const takenN = pipe(integerStream, stream.take(take))

        await pipe(
          takenN,
          stream.toArray,
          task.map((res) => assert.deepStrictEqual(res, expect))
        )()
      })
    )
  })
})
