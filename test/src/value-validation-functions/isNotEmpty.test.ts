import test from 'tape';
import {isNotEmpty} from '../../../main/src/value-validation-functions';

const EMPTY_INPUTS: readonly any[] = [null, undefined, '', [], {}];
const NOT_EMPTY_INPUTS: readonly any[] = ['a', ['a'], {a: 1}, 2, () => {}];

test('isNotEmpty Tests', (assert) => {
  assert.test(`should return false when input is one of ${JSON.stringify(EMPTY_INPUTS)}`, (assert) => {
    assert.plan(EMPTY_INPUTS.length);
    EMPTY_INPUTS.forEach((actual) => {
      assert.false(isNotEmpty(actual), `${JSON.stringify(actual)} should be considered empty`);
    });
  });

  assert.test(`should return true when input is not one of ${JSON.stringify(EMPTY_INPUTS)}`, (assert) => {
    assert.plan(NOT_EMPTY_INPUTS.length);
    NOT_EMPTY_INPUTS.forEach((actual) => {
      assert.true(isNotEmpty(actual), `${JSON.stringify(actual)} should be considered not empty`);
    });
  });

  assert.test(
    'should result in error if the input is not one of the types: string, number, array, function, object',
    (assert) => {
      const invalidInput = Symbol();

      assert.plan(1);
      assert.throws(
        // @ts-ignore
        () => isNotEmpty(invalidInput),
        Error,
        "if a type that is not one of string, number, array, function, object then we don't know how to decide whether the input should be considered empty or not."
      );
    }
  );

  assert.end();
});
