export interface Functor {
  map: (fn: (val: unknown) => unknown) => unknown;
}
export interface Applicative<R> {
  ap: (val: R) => R;
}
// Monad m => (a -> mb ) -> m a -> m b
export interface Monad extends Functor, Applicative<Monad> {
  bind: (fn: (val: unknown) => Monad) => Monad;
  inspect: () => string;
}
