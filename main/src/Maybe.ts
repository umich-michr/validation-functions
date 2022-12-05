//functors: you apply a function to a wrapped value using fmap or <$>
//applicatives: you apply a wrapped function to a wrapped value using <*> or liftA
//monads: you apply a function that returns a wrapped value, to a wrapped value using >>= or liftM
import {Monad} from './functional-interfaces';

export class Maybe<T> implements Monad {
  private readonly value: T;
  readonly isNothing: boolean;

  constructor(val: T) {
    this.value = val;
    //don't forget the value can be boolean so don't use truthy check on val like !val
    this.isNothing =
      val === undefined ||
      val === null ||
      val === '' ||
      (Array.isArray(val) && val.length === 0) ||
      (typeof val !== 'function' && Object(val) === val && Object.entries(val).length === 0);
  }

  static of<T>(val: T) {
    return new Maybe<T>(val);
  }

  inspect() {
    if (this.isNothing) {
      return 'Nothing';
    }
    return typeof this.value === 'function'
      ? `Maybe(${this.value.toString()})`
      : `Maybe(${JSON.stringify(this.value)})`;
  }

  /**
   * Functors apply a function to a wrapped value
   * map :: Monad m => (a -> b) -> m a -> m b
   */
  map(fn: (val: NonNullable<T>) => unknown): Maybe<unknown> {
    if (this.isNothing) {
      return this;
    }
    const f = (val: NonNullable<T>) => new Maybe(fn(val));
    return this.bind(f) as Maybe<unknown>;
  }

  /**
   * Monads apply a function that returns a wrapped value to a wrapped value. Monads have a function >>= (pronounced "bind") to do this.
   * A combinator, typically called bind (as in binding a variable) and represented with an infix operator >>= or a method called flatMap, that unwraps a monadic variable, then inserts it into a monadic function/expression, resulting in a new monadic value
   * (>>=) : (M T, T → M U) → M U[g] so if mx : M T and f : T → M U, then (mx >>= f) : M U
   * bind/flatMap/chain :: Monad m => (a -> mb ) -> m a -> m b
   */
  bind(fn: (val: NonNullable<T>) => Monad): Monad {
    if (this.isNothing) {
      return this;
    }
    return fn(this.value as NonNullable<T>);
  }

  /**
   * Applicatives apply a wrapped function to a wrapped value
   * when this.value is a function, ap applies that function to the maybe passed as argument and returns the resulting maybe
   * ap :: Monad m => m (a -> b) -> m a -> m b
   */
  ap(otherMonad: Monad): Monad {
    if (this.isNothing) {
      return otherMonad;
    }
    return otherMonad.map(this.value as (val: unknown) => unknown) as Monad;
  }

  fork<R>(fN: () => R, fS: (val: T) => R) {
    if (this.isNothing) {
      return fN();
    }
    return fS(this.value);
  }
}
