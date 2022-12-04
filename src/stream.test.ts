import { flow, pipe } from 'fp-ts/lib/function'
import * as stream from './Stream'
import { expect } from 'chai'
import * as fc from 'fast-check'
import { option } from 'fp-ts'

const testStreamOutput =
  <T>(subject: stream.Stream<T>) =>
    async (expected: T[]) => {
      const resultTask = pipe(
        subject,
        stream.toArray,
      )

      expect(await resultTask()).to.deep.equal(expected)
    }

const arbStreamLength = fc.integer({ min: 0, max: 10_000 })


describe('Stream', () => {
  it('running the same stream multiple times will execute multiple iterations', async () => {
    const testStream = pipe(stream.fromRange(0, 5))
    await testStreamOutput(testStream)([0, 1, 2, 3, 4])
    await testStreamOutput(testStream)([0, 1, 2, 3, 4])
  })

  it('is lazily evaluated', async () => {
    let isEvaluated = false
    const tracking = stream.fromRec((n: option.Option<number>) => {
      isEvaluated = true
      return pipe(n, option.map(r => r + 1))
    })

    const testStream: stream.Stream<number> = pipe(tracking(option.some(0)), stream.take(5))

    expect(isEvaluated).to.be.false

    await testStreamOutput(testStream)([0, 1, 2, 3, 4])

    expect(isEvaluated).to.be.true
  })

  describe('fromRec', () => {
    it('streams a recursive function', async () => {
      const testStream = pipe(stream.fromRange(0, 5))

      await testStreamOutput(testStream)([0, 1, 2, 3, 4])
    })

    it('could produce an large stream without stack overflow', async () => {
      const streamLength = 1_000_000
      const lastElementTask = pipe(stream.fromRange(0, streamLength), stream.execute((_, t) => t, -1))
      const lastElement = await lastElementTask()
      expect(lastElement).to.equal(streamLength - 1)
    })
  })

  describe('fromArray', () => {
    it('creates a stream from array elements', async () => {
      const testStream = stream.fromArray(['a', 'b', 'c', 'd'])
      await testStreamOutput(testStream)(['a', 'b', 'c', 'd'])
    })
  })

  describe('fromTask', () => {
    it('creates a stream a task result', async () => {
      const testStream = stream.fromTask(async () => true)
      await testStreamOutput(testStream)([true])
    })
  })

  describe('stream.map', () => {
    it('maps elements of a stream', async () => {
      const testStream = pipe(
        stream.fromRange(0, 5),
        stream.map(n => n + 100),
      )

      await testStreamOutput(testStream)([100, 101, 102, 103, 104])
    })
  })

  describe('stream.chain', () => {
    it('flatMaps elements of a stream', async () => {
      const testStream = pipe(
        stream.fromRange(0),
        stream.chain(n => stream.fromArray([n + 100, n + 200])),
        stream.take(5),
      )

      await testStreamOutput(testStream)([100, 200, 101, 201, 102])
    })
  })

  describe('stream.take', () => {
    it('takes first N elements of a stream', async () => {
      const testStream = pipe(stream.fromRange(0), stream.take(100))

      await testStreamOutput(testStream)(
        Array(100)
          .fill(1)
          .map((_, idx) => idx),
      )
    })

    it('takes first N elements from a stream longer than the taken length', async () => {
      const streamLongerThanTaken = (take: number) => {
        const arbFirstNArray = fc.array(fc.integer(), { minLength: take, maxLength: take })
        const arbExtra = arbStreamLength
        const arbExtraArray =
          arbExtra.chain(extra => fc.array(fc.integer(), { minLength: extra, maxLength: extra }))

        return fc.record({
          arbFirstNArray,
          arbExtraArray,
        }).map(({ arbFirstNArray, arbExtraArray }) => ({
          expect: arbFirstNArray,
          integerStream: stream.fromArray([...arbFirstNArray, ...arbExtraArray]),
        }))
      }

      const streamDefn =
        arbStreamLength.chain((take) =>
          fc.record({
            take: fc.constant(take),
            defn: streamLongerThanTaken(take),
          })
        )

      await fc.assert(
        fc.asyncProperty(streamDefn, async ({ take, defn: { expect, integerStream } }) => {
          const takenN = pipe(
            integerStream,
            stream.take(take),
          )

          await testStreamOutput(takenN)(expect)
        })
      );
    })

    it('takes all elements from a stream shorter than the taken length', async () => {
      const streamShorterThanTaken = (take: number) => {
        const arbSparse = fc.integer({ min: 0, max: take })


        const arbArray = arbSparse.chain(sparse =>
          fc.array(fc.integer(), { minLength: sparse, maxLength: sparse })
        )

        return arbArray.map(expect => ({
          expect: expect,
          integerStream: stream.fromArray(expect),
        }))
      }

      const streamDefn =
        arbStreamLength.chain((take) =>
          fc.record({
            take: fc.constant(take),
            defn: streamShorterThanTaken(take),
          })
        )

      await fc.assert(
        fc.asyncProperty(streamDefn, async ({ take, defn: { expect, integerStream } }) => {
          const takenN = pipe(
            integerStream,
            stream.take(take),
          )

          await testStreamOutput(takenN)(expect)
        })
      );
    })
  })

  describe('stream.chunksOf', () => {
    it('chunks elements of a stream', async () => {
      const testStream = pipe(stream.fromRange(0), stream.chunksOf(5), stream.take(2))

      await testStreamOutput(testStream)([
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
      ])
    })

    it('emits the last bach if it has any elements', async () => {
      const testStream = pipe(stream.fromRange(0, 5), stream.chunksOf(3))

      await testStreamOutput(testStream)([
        [0, 1, 2],
        [3, 4],
      ])
    })

    it('does not emit the last chunk if its empty', async () => {
      const testStream = pipe(stream.fromRange(0), stream.take(3), stream.chunksOf(3))

      await testStreamOutput(testStream)([[0, 1, 2]])
    })

    it('chunks arbitrary sized chunks', async () => {
      const chunk = (chunkSize: number) => {
        return fc.array(fc.integer(), { minLength: chunkSize, maxLength: chunkSize })
      }


      const chunks = (chunkSize: number) => {
        const fullChunks = fc.array(chunk(chunkSize))

        const lastChunk = fc.array(fc.integer(), { minLength: 1, maxLength: chunkSize })

        const expect = fc.tuple(fullChunks, lastChunk).map(([full, last]) => [...full, last])

        return fc.record({
          chunkSize: fc.constant(chunkSize),
          expect,
        })
      }

      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 10_000 }).chain(chunks), async ({ expect, chunkSize }) => {
          const chunked = pipe(
            stream.fromArray(expect.flat()),
            stream.chunksOf(chunkSize),
          )

          await testStreamOutput(chunked)(expect)
        })
      )
    })
  })

  describe('stream.filter', () => {
    it('filter elements based on predicate', async () => {
      const testStream = pipe(
        stream.fromRange(0),
        stream.filter(r => r % 2 === 0),
        stream.take(5),
      )

      await testStreamOutput(testStream)([0, 2, 4, 6, 8])
    })
  })
})
