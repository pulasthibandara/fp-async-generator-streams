import { pipe } from 'fp-ts/lib/function'
import * as stream from './stream'
import { expect } from 'chai'

const testStreamOutput =
  <T>(subject: stream.Stream<T>) =>
    async (expected: T[]) => {
      const result = pipe(
        subject,
        stream.execute((agg, c) => [...agg, c], Array<T>()),
      )

      expect(await result()).to.deep.equal(expected)
    }

const incrementing = stream.fromRec((n: number) => n + 1)

describe('Stream', () => {
  it('running the same stream multiple times will execute multiple iterations', async () => {
    const testStream = pipe(incrementing(0), stream.take(5))
    await testStreamOutput(testStream)([0, 1, 2, 3, 4])
    await testStreamOutput(testStream)([0, 1, 2, 3, 4])
  })

  it('is lazily evaluated', async () => {
    let isEvaluated = false
    const tracking = stream.fromRec((n: number) => {
      isEvaluated = true
      return n + 1
    })

    const testStream: stream.Stream<number> = pipe(tracking(0), stream.take(5))

    expect(isEvaluated).to.be.false

    await testStreamOutput(testStream)([0, 1, 2, 3, 4])

    expect(isEvaluated).to.be.true
  })

  describe('fromRec', () => {
    it('streams a recursive function', async () => {
      const testStream = pipe(incrementing(0), stream.take(5))

      await testStreamOutput(testStream)([0, 1, 2, 3, 4])
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
        incrementing(0),
        stream.take(5),
        stream.map(n => n + 100),
      )

      await testStreamOutput(testStream)([100, 101, 102, 103, 104])
    })
  })

  describe('stream.chain', () => {
    it('flatMaps elements of a stream', async () => {
      const testStream = pipe(
        incrementing(0),
        stream.chain(n => stream.fromArray([n + 100, n + 200])),
        stream.take(5),
      )

      await testStreamOutput(testStream)([100, 200, 101, 201, 102])
    })
  })

  describe('stream.take', () => {
    it('takes first N elements of a stream', async () => {
      const testStream = pipe(incrementing(0), stream.take(100))

      await testStreamOutput(testStream)(
        Array(100)
          .fill(1)
          .map((_, idx) => idx),
      )
    })
  })

  describe('stream.chain', () => {
    it('batches elements of a stream', async () => {
      const testStream = pipe(incrementing(0), stream.batch(5), stream.take(2))

      await testStreamOutput(testStream)([
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
      ])
    })

    it('emits the last bach if it has any elements', async () => {
      const testStream = pipe(incrementing(0), stream.take(5), stream.batch(3))

      await testStreamOutput(testStream)([
        [0, 1, 2],
        [3, 4],
      ])
    })

    it('does not emit the last batch if its empty', async () => {
      const testStream = pipe(incrementing(0), stream.take(3), stream.batch(3))

      await testStreamOutput(testStream)([[0, 1, 2]])
    })
  })

  describe('stream.filter', () => {
    it('filter elements based on predicate', async () => {
      const testStream = pipe(
        incrementing(0),
        stream.filter(r => r % 2 === 0),
        stream.take(5),
      )

      await testStreamOutput(testStream)([0, 2, 4, 6, 8])
    })
  })
})
