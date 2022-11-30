import test from 'tape';
import {Validation, ValidationResult} from '../../main/src/Validation';
import {ValidationRuleName} from '../../main/src';
/* eslint-disable @typescript-eslint/no-empty-function */

test('Validation should create a validation object using a simple value', (assert) => {
  const value = 5;
  const expected = `Validation(${JSON.stringify(new ValidationResult(value))})`;

  const actual = Validation.of(value);

  assert.equals(actual.inspect(), expected);
  assert.end();
});

test('Validation should create a validation object using a function as a value', (assert) => {
  const value = () => {};
  const expected = `Validation(${value.toString()})`;

  const actual = Validation.of(value);

  assert.equals(actual.inspect(), expected);
  assert.end();
});

test('Validation should be valid when all of the validation result values are set to true', (assert) => {
  const allTrue = new ValidationResult('jdoe@gmail.com', [], ['required', 'email', 'maxLength']);
  const noValidationResult = new ValidationResult('jdoe@gmail.com');
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const functionInput = () => {};

  [allTrue, noValidationResult, functionInput].forEach((input) => {
    const actual = new Validation(input);
    assert.true(actual.isValid, 'should be valid when all validation results are true or the input is a function');
  });
  assert.end();
});

test('Validation should be invalid when any of the validation result values are set to false', (assert) => {
  const onlyOneValidationFalse = new ValidationResult('', ['required']);
  const allFalse = new ValidationResult('', ['required', 'email', 'maxLength']);
  const onlyTheFirstFalse = new ValidationResult('a', ['required'], ['email', 'maxLength']);
  const onlyTheSecondFalse = new ValidationResult('a', ['email'], ['required', 'maxLength']);
  const onlyTheThirdFalse = new ValidationResult('a', ['maxLength'], ['required', 'email']);
  const onlyTheFirstTwoFalse = new ValidationResult('a', ['required', 'email'], ['maxLength']);
  const onlyTheLastTwoFalse = new ValidationResult('a', ['email', 'maxLength'], ['required']);
  [
    onlyOneValidationFalse,
    allFalse,
    onlyTheFirstFalse,
    onlyTheSecondFalse,
    onlyTheThirdFalse,
    onlyTheFirstTwoFalse,
    onlyTheLastTwoFalse
  ].forEach((input) => {
    const actual = new Validation(input);
    assert.false(actual.isValid, 'should be invalid when any number of validation results are set to false');
  });

  assert.end();
});

test('Given a function that will return a monad When bind is called Then the function should be applied to the wrapped value and the monad return value should be returned', (assert) => {
  const fn = (a: ValidationResult) => new Validation(new ValidationResult((a.value as number) * 5));
  const expected = 'Validation({"value":25,"failed":[],"successful":[]})';

  const actual = Validation.of(5).bind(fn);

  assert.equals(actual.inspect(), expected);
  assert.end();
});

test('Given a function that will return a monad When bind is called on a Validation wrapping a function Then the the same validation should be returned', (assert) => {
  const fn = (a: ValidationResult) => new Validation(new ValidationResult((a.value as number) * 5));
  const expected = Validation.of(() => {});

  const actual = expected.bind(fn);

  assert.equals(actual, expected);
  assert.end();
});

test('Given a function that will return a new value When map is called Then the function should be applied to the wrapped value and Validation object wrapping the new value should be returned', (assert) => {
  const fn = (a: ValidationResult) => new ValidationResult((a.value as number) * 5);
  const expected = 'Validation({"value":25,"failed":[],"successful":[]})';

  const actual = Validation.of(5).map(fn);

  assert.equals(actual.inspect(), expected);
  assert.end();
});

test('Given a function that will return a new value When map is called on a validation wrapping a function Then the same Validation object should be returned', (assert) => {
  const fn = (a: ValidationResult) => new ValidationResult((a.value as number) * 5);
  const expected = Validation.of(() => {});

  const actual = expected.map(fn);

  assert.equals(actual, expected);
  assert.end();
});

test("Given wrapped value is a function that will return a new value and a Monad is passed When ap is called Then the wrapped function should be applied to the wrapped value of the Monad and a Monad with the function's output value should be returned", (assert) => {
  const fn = (a: ValidationResult) => new ValidationResult((a.value as number) * 5);

  const actual = new Validation(fn).ap(Validation.of(5));
  const expected = 'Validation({"value":25,"failed":[],"successful":[]})';

  assert.equals(actual.inspect(), expected);
  assert.end();
});

test('Given wrapped value is not a function When Validation.ap is called Then an error should be raised', (assert) => {
  const fn = new ValidationResult('not a function');

  assert.throws(
    () => new Validation(fn).ap(Validation.of(5)),
    Error,
    "applying a validation that doesn't wrap a function onto another monad should raise error"
  );

  assert.end();
});

test('reduceFail should allow for reducing all failed validation results into one return value', (assert) => {
  const validationState = new ValidationResult('not a function', ['required', 'maxLength'], ['email']);
  const validation = new Validation(validationState);
  const messages: {[key in ValidationRuleName]: string} = {
    required: 'requiredMsg',
    email: 'emailMsg',
    maxLength: 'maxLengthMsg'
  };
  const expected = validationState.failed.reduce((acc, res) => acc.concat(messages[res]), [] as string[]);

  const actual = validation.reduceFail((acc, curr) => acc.concat(messages[curr]), [] as string[]);

  assert.deepEquals(actual, expected, 'reduce should have returned the messages only for the failed rules.');
  assert.end();
});

test('reduceFail should return undefined if wrapped value is a function.', (assert) => {
  const actual = Validation.of(() => {}).reduceFail((acc, curr) => acc + curr.toString(), '');

  assert.equal(actual, undefined, 'should return undefined when wrapped value is a function.');
  assert.end();
});
