import {Test} from 'tape';
import {Validation, ValidationState} from '../../../main/src/Validation';
import {ValidationResults, ValidationRules} from '../../../main/src';
import {validate} from '../../../main/src/rule-validation-functions';

function* validationGenerator(
  valueIterator: IterableIterator<any>,
  results: ValidationResults | IterableIterator<ValidationState>
): Generator<Validation> {
  const nextVal = valueIterator.next();
  const res = Array.isArray(results) ? results : results.next().value;
  if (nextVal.done) {
    return;
  }
  yield new Validation(new ValidationState(nextVal.value, res));
  yield* validationGenerator(valueIterator, results);
}

function* expectedGenerator(values: any[], results: ValidationResults | ValidationResults[]): Generator<Validation> {
  const res = (Array.isArray(results[0][0]) ? results[Symbol.iterator]() : results) as
    | ValidationResults
    | IterableIterator<ValidationState>;
  yield* validationGenerator(values[Symbol.iterator](), res);
}

export function testValidationFor(values: any[], rules: ValidationRules) {
  return {
    setExpectation(results: ValidationResults | ValidationResults[]) {
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
