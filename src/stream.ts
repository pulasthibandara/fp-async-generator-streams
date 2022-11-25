import { Monad1 } from 'fp-ts/Monad'
import { Functor1 } from 'fp-ts/Functor'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/lib/function'
import { Apply1 } from 'fp-ts/lib/Apply'
import { Chain1, bind as chainBind } from 'fp-ts/lib/Chain'
import { Pointed1 } from 'fp-ts/lib/Pointed'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * A light-weight, lazy, async generator based stream implementation.
 * Move to core/utils when used by another module.
 *
 * @category model
 * @since 2.0.0
 */
export type Stream<A> = () => AsyncGenerator<A, void, undefined>

/**
 * @category instances
 * @since 2.0.0
 */
export const URI = 'Stream'

/**
 * @category instances
 * @since 2.0.0
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Stream<A>
  }
}

// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------

export const of: Pointed1<URI>['of'] = a =>
  async function* () {
    yield a
  }

export const execute =
  <T, A>(fn: (agg: A, t: T) => A, init: A) =>
    (gen: Stream<T>) =>
      async (): Promise<A> => {
        let agg = init
        for await (const item of gen()) {
          agg = fn(agg, item)
        }

        return agg
      }

export const executeVoid = execute(() => { }, undefined)

export const batch =
  (batchSize: number) =>
    <T>(gen: Stream<T>): Stream<T[]> =>
      async function* () {
        let _batch: T[] = []
        for await (const item of gen()) {
          if (_batch.length < batchSize) {
            _batch.push(item)
          } else {
            yield _batch
            _batch = [item]
          }
        }

        if (_batch.length) {
          yield _batch
        }
      }

export const map =
  <A, B>(fn: (a: A) => B) =>
    (gen: Stream<A>): Stream<B> =>
      async function* () {
        for await (const item of gen()) {
          yield fn(item)
        }
      }

export const chain =
  <A, B>(fn: (a: A) => Stream<B>) =>
    (gen: Stream<A>): Stream<B> =>
      async function* () {
        for await (const item of gen()) {
          for await (const b of fn(item)()) {
            yield b
          }
        }
      }

export const fromRec =
  <A>(fn: (a: A) => A) =>
    (a: A): Stream<A> =>
      async function* () {
        yield a
        yield* fromRec(fn)(fn(a))()
      }

export const fromTask = <A>(task: task.Task<A>): Stream<A> =>
  async function* () {
    yield task()
  }

export const fromTaskK =
  <A, B>(task: (a: A) => task.Task<B>) =>
    (a: A): Stream<B> =>
      fromTask(task(a))

export const fromArray = <A>(array: A[]): Stream<A> =>
  async function* () {
    yield* array
  }

export const fromArrayK =
  <A, B>(array: (a: A) => B[]) =>
    (a: A): Stream<B> =>
      fromArray(array(a))

export const filter =
  <A>(fn: (a: A) => boolean) =>
    (gen: Stream<A>): Stream<A> =>
      async function* () {
        for await (const item of gen()) {
          if (fn(item)) {
            yield item
          }
        }
      }

export const take =
  (n: number) =>
    <T>(gen: Stream<T>): Stream<T> =>
      async function* () {
        let count = 0

        for await (const item of gen()) {
          if (count >= n) {
            break
          }

          count++
          yield item
        }
      }

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const _map: Functor1<URI>['map'] = (fa, f) => pipe(fa, map(f))
const _ap: Apply1<URI>['ap'] = (fab, fa) =>
  pipe(
    fab,
    chain(f => pipe(fa, map(f))),
  )
const _chain: Chain1<URI>['chain'] = (ma, f) => pipe(ma, chain(f))

/**
 * @category instances
 * @since 2.10.0
 */
export const Monad: Monad1<URI> = {
  URI,
  map: _map,
  of,
  ap: _ap,
  chain: _chain,
}

/**
 * @category instances
 * @since 2.10.0
 */
export const Chain = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
}

// export const bind = chainBind(Chain)
