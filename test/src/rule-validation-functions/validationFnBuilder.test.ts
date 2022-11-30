import test from 'tape';
import {ValidationResult} from '../../../main/src/Validation';
import {RULE_NAMES, validationFnBuilder} from '../../../main/src/rule-validation-functions';

const input = 'a@b.com';
const alwaysTrueValidator = () => true;

test(`Given a ruleName in ${RULE_NAMES}
              And a fn of ${alwaysTrueValidator}
             When validationFnBuilder is called
             Then a fn of type (state: ValidationState)=>ValidationState should be returned
              And the resulting function should always return validation result to be true for all ruleNa,es.`, (assert) => {
  const validationState = new ValidationResult(input);

  assert.plan(RULE_NAMES.length);

  RULE_NAMES.forEach((rule) => {
    const expected = new ValidationResult(input, [], [rule]);
    const actual = validationFnBuilder(rule, alwaysTrueValidator)(validationState);
    assert.deepEquals(actual, expected, `value: ${input} should pass ${rule} validation`);
  });
});
