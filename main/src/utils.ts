/**
 * Courtesy of https://javascript.info/currying-partials
 * @example <caption>Example usage:</caption>
 * // returns 6
 * let curriedSum = curry((a, b, c) => a + b + c);
 * curriedSum(1, 2, 3); // 6, still callable normally
 * curriedSum(1)(2,3); // 6, currying of 1st arg
 * curriedSum(1)(2)(3); // 6, full currying
 * @param func Function to curry.
 */
//eslint-disable-next-line @typescript-eslint/ban-types
export function curry(func: Function) {
  return function curried(...args: unknown[]) {
    if (args.length >= func.length) {
      return func.apply(curried, args);
    } else {
      return function (...args2: unknown[]) {
        return curried.apply(curried, args.concat(args2));
      };
    }
  };
}
