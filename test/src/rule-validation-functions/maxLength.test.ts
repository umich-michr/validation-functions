import test from 'tape';
import {ValidationRuleName, ValidationRules, validate} from '../../../main/src';
import {testValidationFor} from './rule-validation-test-helpers';
import {Validation, ValidationResult} from '../../../main/src/Validation';

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

test(`${RULE_NAME} validation should validate when maxLength option value is entered as string but a valid number: ${VALID_INPUTS[5]}`, (assert) => {
  assert.plan(2);

  const rule = {maxLength: {value: '1'}};
  const successVal = 'a',
    failVal = 'ab';
  const expectedSuccess = Validation.of(new ValidationResult(successVal, [], ['maxLength']));
  const expectedFail = Validation.of(new ValidationResult(failVal, ['maxLength'], []));

  //@ts-ignore
  const actualSuccess = validate(rule)(successVal);
  //@ts-ignore
  const actualFail = validate(rule)(failVal);

  assert.equals(
    actualSuccess.inspect(),
    expectedSuccess.inspect(),
    `${JSON.stringify(rule)} rule validation should return ${expectedSuccess} for value: ${successVal}`
  );

  assert.equals(
    actualFail.inspect(),
    expectedFail.inspect(),
    `${JSON.stringify(rule)} rule validation should return ${expectedFail} for value: ${failVal}`
  );
});

test(`${RULE_NAME} validation should throw error if rule option value is anything other than a number: ${JSON.stringify(
  VALID_INPUTS
)}`, (assert) => {
  assert.plan(1);

  assert.throws(
    //@ts-ignore
    () => validate({maxLength: {value: 'a'}})('a'),
    Error,
    'should throw exception when rule option value is not a number'
  );
});
