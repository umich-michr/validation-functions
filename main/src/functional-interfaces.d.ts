/* eslint-disable @typescript-eslint/no-explicit-any*/
export interface Functor<T, R> {
  map: (fn: (val: T) => any) => R;
}
export interface Applicative<R> {
  ap: (val: R) => R;
}
// Monad m => (a -> mb ) -> m a -> m b
export interface Monad<A> extends Functor<A, Monad<any>>, Applicative<Monad<any>> {
  bind: (fn: (val: A) => Monad<any>) => Monad<any>;
  inspect: () => string;
}
