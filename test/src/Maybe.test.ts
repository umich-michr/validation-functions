import test from 'tape';
import {Maybe} from '../../main/src/Maybe';
import {Validation, ValidationState} from '../../main/src/Validation';

test('Creating Maybe instances', (assert) => {
  assert.plan(2);

  assert.true(new Maybe('a') instanceof Maybe, 'constructor should create a type of Maybe');
  assert.true(
    Maybe.of('a') instanceof Maybe,
    '"of" should act like a monad unit function, converting a value to type of Maybe'
  );
});

test('If Maybe wraps empty string, undefined, null, empty array or empty object Then it should be Nothing', (assert) => {
  assert.plan(6);

  assert.true(Maybe.of('').isNothing, 'Empty string should be Nothing');
  assert.true(Maybe.of(undefined).isNothing, 'undefined should be Nothing');
  assert.true(Maybe.of(null).isNothing, 'null should be Nothing');
  assert.true(Maybe.of([]).isNothing, 'empty array should be Nothing');
  assert.true(Maybe.of({}).isNothing, 'empty object should be Nothing');
  assert.false(Maybe.of('a').isNothing, 'any value other than null, undefined, empty string should not be Nothing');
});

test('inspect function should return string representation of Maybe', (assert) => {
  assert.plan(4);

  assert.equals(Maybe.of('a').inspect(), 'Maybe("a")');
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  assert.equals(Maybe.of(() => {}).inspect(), 'Maybe(() => { })');
  assert.equals(Maybe.of({a: 1}).inspect(), 'Maybe({"a":1})');
  assert.equals(Maybe.of(null).inspect(), 'Nothing');
});

test("map should apply the function passed as arg to the wrapped value and should return a Maybe wrapping the value of the function's return value", (assert) => {
  const fn = (val: string) => val[0].toUpperCase() + val.slice(1, val.length + 1);
  const testMaybe = Maybe.of('test');

  const actualMaybe = testMaybe.map(fn);

  assert.plan(3);

  assert.notEquals(actualMaybe, testMaybe, 'map should return a new Maybe, should not modify Maybe');
  assert.equals(
    actualMaybe.inspect(),
    'Maybe("Test")',
    'map should return a new Maybe wrapping the value that is returned by the function applied on the wrapped value.'
  );
  assert.equals(
    Maybe.of('').map(fn).inspect(),
    'Nothing',
    'map should return Nothing if the wrapped value corresponds to Nothing'
  );
});

test('bind should apply the function passed as arg to the wrapped value and should return the Monad the function returns', (assert) => {
  const fn = (val: string) => Validation.of(val[0].toUpperCase() + val.slice(1, val.length + 1));
  const testMaybe = Maybe.of('test');

  const actualValidation = testMaybe.bind(fn);

  assert.plan(2);

  assert.equals(
    actualValidation.inspect(),
    'Validation({"value":"Test","failed":[],"successful":[]})',
    'bind should return the monad returned by the function which was passed as arg ater applied to the value wrapped by Maybe'
  );
  assert.equals(
    Maybe.of('').bind(fn).inspect(),
    'Nothing',
    'bind should return Nothing if the wrapped value corresponds to Nothing'
  );
});

test('ap should apply the function wrapped by the Maybe to the value wrapped by the Monad passed as arg and return the result in a new Maybe', (assert) => {
  const fn = (val: any) => new ValidationState(val.value[0].toUpperCase() + val.value.slice(1, val.value.length + 1));
  const fnMaybe = Maybe.of(fn);
  const validation = Validation.of('test');

  const actual = fnMaybe.ap(validation);

  assert.plan(2);

  assert.equals(
    actual.inspect(),
    'Validation({"value":"Test","failed":[],"successful":[]})',
    "ap should return the Monad wrapping the value returned by the Maybe's function applied to the value wrapped by Monad passed as arg"
  );
  assert.equals(
    Maybe.of('').ap(validation),
    validation,
    'ap should return the argument as is if the wrapped value corresponds to Nothing'
  );
});

test('catchMap should return the value returned by function arg if Maybe resolves to Nothing otherwise returns the Maybe', (assert) => {
  const expectedNothing = Maybe.of('will run');
  const expectedSomething = Maybe.of('test');
  const actualValue = expectedSomething.catchMap(() => Maybe.of('will not run'));
  const actualNothing = Maybe.of(null).catchMap(() => expectedNothing);

  assert.plan(2);

  assert.equals(actualValue, expectedSomething, 'catchMap should return the Maybe as is if it is not Nothing');
  assert.equals(
    actualNothing,
    expectedNothing,
    'catchMap should return the return value of function passed as argument if Maybe resolve to Nothing'
  );
});

test('fork should accept 2 functions and run and return the result of the first if Maybe resolves to Nothing otherwise should apply the second function to the wrapped value and return the result', (assert) => {
  const actualValue = Maybe.of('test').fork(
    () => 'will not run 1st fn',
    (val: any) => `will run the 2nd fn with the val: ${val}`
  );
  const actualNothing = Maybe.of('').fork(
    () => 'will run 1st fn',
    (val: any) => 'will not run the 2nd fn'
  );

  assert.plan(2);

  assert.equals(
    actualValue,
    'will run the 2nd fn with the val: test',
    'fork should return the return value of the first function passed as arg'
  );
  assert.equals(
    actualNothing,
    'will run 1st fn',
    'fork should return the return value of the first 2nd function passed as arg applied to the wrapped value of the Maybe'
  );
});
