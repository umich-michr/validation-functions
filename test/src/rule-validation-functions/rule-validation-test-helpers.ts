import {Test} from 'tape';
import {Validation, ValidationState} from '../../../main/src/Validation';
import {ValidationRuleName, ValidationRules} from '../../../main/src';
import {validate} from '../../../main/src';

function* validationGenerator(
  valueIterator: IterableIterator<unknown>,
  results: [ValidationRuleName, boolean][] | IterableIterator<ValidationState>
): Generator<Validation> {
  const nextVal = valueIterator.next();
  const res = Array.isArray(results) ? results : results.next().value;
  if (nextVal.done) {
    return;
  }

  const failed = res.filter((r: unknown[]) => !r[1]).map((r: unknown[]) => r[0]);
  const success = res.filter((r: unknown[]) => r[1]).map((r: unknown[]) => r[0]);
  yield new Validation(new ValidationState(nextVal.value, failed, success));
  yield* validationGenerator(valueIterator, results);
}

function* expectedGenerator(
  values: unknown[],
  results: [ValidationRuleName, boolean][] | [ValidationRuleName, boolean][][]
): Generator<Validation> {
  const res = (Array.isArray(results[0][0]) ? results[Symbol.iterator]() : results) as
    | [ValidationRuleName, boolean][]
    | IterableIterator<ValidationState>;
  yield* validationGenerator(values[Symbol.iterator](), res);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function testValidationFor(values: any[], rules: ValidationRules) {
  return {
    setExpectation(results: [ValidationRuleName, boolean][] | [ValidationRuleName, boolean][][]) {
      const expectedValidations = expectedGenerator(values, results);
      const validateRule = validate(rules);
      return {
        assert(assert: Test) {
          assert.plan(values.length);

          values.forEach((val) => {
            const expected = expectedValidations.next().value.inspect();
            const actual = validateRule(val).inspect();

            assert.equals(
              actual,
              expected,
              `${JSON.stringify(rules)} rule validation should return ${expected} for value: ${JSON.stringify(val)}`
            );
          });
        }
      };
    }
  };
}
