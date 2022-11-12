import test from 'tape';
import {ValidationRuleName, ValidationRules} from '../../../main/src';
import {testValidationFor} from './rule-validation-test-helpers';

const RULE_NAME: ValidationRuleName = 'maxLength';
const VALIDATION_RULE: ValidationRules = {[RULE_NAME]: {value: 2}};

const VALID_INPUTS = [null, undefined, '', ' ', '  ', 'a', 'ab', '0', '10'];
const INVALID_INPUTS = ['   ', '  a', 'a  ', ' a ', 'abc', '1234567890'];

test(`${RULE_NAME} validation should return true for values: ${JSON.stringify(VALID_INPUTS)}`, (assert) => {
  const expectedResult = true;

  testValidationFor(VALID_INPUTS, VALIDATION_RULE)
    .setExpectation([[RULE_NAME, expectedResult]])
    .assert(assert);
});

test(`${RULE_NAME} validation should return false for values: ${JSON.stringify(INVALID_INPUTS)}`, (assert) => {
  const expectedResult = false;

  testValidationFor(INVALID_INPUTS, VALIDATION_RULE)
    .setExpectation([[RULE_NAME, expectedResult]])
    .assert(assert);
});
