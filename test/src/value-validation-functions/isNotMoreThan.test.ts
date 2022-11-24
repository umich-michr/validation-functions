/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'tape';
import {isNotMoreThan} from '../../../main/src/value-validation-functions';

const EMPTY_INPUTS = [null, undefined, '', [], {}];
const testCountFromInput = (inputs: [number, any[]][]) => inputs.reduce((acc, inputSet) => acc + inputSet[1].length, 0);

test('isNotMoreThan Tests', (assert) => {
  assert.test('should return true when the string arg length is not greater than max length arg', (assert) => {
    const VALID_INPUTS: [number, any[]][] = [
      [0, EMPTY_INPUTS],
      [1, ['a', 1, ['a'], {a: 1}]],
      [3, ['abc', 123, ['a', 'b', 'c'], {a: 1, b: 1, c: 1}, ...EMPTY_INPUTS]]
    ];

    assert.plan(testCountFromInput(VALID_INPUTS));

    VALID_INPUTS.forEach(([limit, inputs]) => {
      inputs.forEach((input) => {
        assert.true(isNotMoreThan(limit)(input), `${JSON.stringify(input)} is not longer than ${limit}`);
      });
    });
  });

  assert.test('should return false when the string arg length is greater than max length arg', (assert) => {
    const INVALID_INPUTS: [number, any[]][] = [
      [0, ['a', 1, ['a', 'b'], {a: 1, b: 2}]],
      [3, ['rose', 1.23, ['r', 'b', 'c', 'd'], {a: 1, b: 1, c: 1, d: 1}]]
    ];

    assert.plan(testCountFromInput(INVALID_INPUTS));

    INVALID_INPUTS.forEach(([limit, inputs]) => {
      inputs.forEach((input) => {
        assert.false(isNotMoreThan(limit)(input), `${JSON.stringify(input)} is longer than ${limit}`);
      });
    });
  });

  assert.test(
    'should throw error for unsupported input types (anything other than string, number, array, object whose entries can be counted)',
    (assert) => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const INVALID_INPUTS: [number, any[]][] = [[10, [Symbol(), () => {}]]];

      assert.plan(testCountFromInput(INVALID_INPUTS));

      INVALID_INPUTS.forEach(([limit, inputs]) => {
        inputs.forEach((input) => {
          assert.throws(
            () => isNotMoreThan(limit)(input),
            Error,
            "if a type that is not one of string, number, array, object with key count then we don't know how to decide whether the input should be considered longer than the specified limit."
          );
        });
      });
    }
  );
});
