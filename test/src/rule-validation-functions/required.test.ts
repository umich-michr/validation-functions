import test from 'tape';
import {ValidationRuleName, ValidationRules} from '../../../main/src';
import {testValidationFor} from './rule-validation-test-helpers';

const RULE_NAME: ValidationRuleName = 'required';
const VALIDATION_RULE: ValidationRules = {[RULE_NAME]: {value: true}};

const INVALID_INPUTS = [null, undefined, '', '   ', [], {}];
const VALID_INPUTS = ['a', 5, ['a'], {a: 1}];

test(`${RULE_NAME} validation should return true when not enabled for invalid value: ${INVALID_INPUTS[0]}`, (assert) => {
  const expectedResult = true;

  testValidationFor([INVALID_INPUTS[0]], {[RULE_NAME]: {value: false}})
    .setExpectation([[RULE_NAME, expectedResult]])
    .assert(assert);
});

test(`${RULE_NAME} validation should return false for empty values: ${JSON.stringify(INVALID_INPUTS)}`, (assert) => {
  const expectedResult = false;

  testValidationFor(INVALID_INPUTS, VALIDATION_RULE)
    .setExpectation([[RULE_NAME, expectedResult]])
    .assert(assert);
});

test(`${RULE_NAME} validation should return true for non-empty values: ${JSON.stringify(VALID_INPUTS)}`, (assert) => {
  const expectedResult = true;
  testValidationFor(VALID_INPUTS, VALIDATION_RULE)
    .setExpectation([[RULE_NAME, expectedResult]])
    .assert(assert);
});
