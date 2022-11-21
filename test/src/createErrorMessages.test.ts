import test from 'tape';
import {ValidationRules} from '../../main/src';
import {Validation, ValidationState} from '../../main/src/Validation';
import {createErrorMessages, DEFAULT_ERROR_MESSAGES} from '../../main/src/createErrorMessages';

test('Generate error messages from Validation object with user supplied error messages', (assert) => {
  assert.plan(1);

  const validationState = new ValidationState(5, ['required', 'email', 'maxLength']);
  const validation = Validation.of(validationState);
  const rules: Required<ValidationRules> = {
    required: {value: true, errorMessage: 'You missed this required field'},
    email: {value: true, errorMessage: 'Should have entered valid email address'},
    maxLength: {value: 2, errorMessage: 'Should have entered less than {value} characters.'}
  };

  const expected = [
    rules.required.errorMessage,
    rules.email.errorMessage,
    rules.maxLength.errorMessage?.replace('{value}', rules.maxLength.value.toString())
  ];

  const actual = createErrorMessages(rules, DEFAULT_ERROR_MESSAGES)(validation);

  assert.deepEquals(actual, expected, `email and maxLength error messages should be displayed as: ${expected}`);
});

test('Generate error messages from Validation object with no user specified error message using default message', (assert) => {
  assert.plan(1);

  const validation = Validation.of(new ValidationState(5, ['required', 'email', 'maxLength']));
  const rules = {required: {value: true}, email: {value: true}, maxLength: {value: 2}};
  const defaultErrorMessages = {
    required: 'You missed this required field',
    email: 'Please enter valid email address',
    maxLength: '{value} is the maximum allowed length'
  };
  const expected = [
    defaultErrorMessages.required,
    defaultErrorMessages.email,
    defaultErrorMessages.maxLength.replace('{value}', rules.maxLength.value.toString())
  ];

  const actual = createErrorMessages(rules, defaultErrorMessages)(validation);

  assert.deepEquals(
    actual,
    expected,
    `when there is no user specified err msg for failing rule then default error messages should be displayed as: ${expected}`
  );
});

test('Generate error messages from Validation object with non-existent rule', (assert) => {
  assert.plan(1);

  // to test non-existent rules impact on the code ignored ts type check
  // @ts-ignore
  const validation = Validation.of(new ValidationState(5, ['non-existent rule']));
  const rules: ValidationRules = {required: {value: true}};
  const expected = ["Couldn't find validation error message. Check rule definitions or the default error messages."];

  const actual = createErrorMessages(rules, DEFAULT_ERROR_MESSAGES)(validation);

  assert.deepEquals(
    actual,
    expected,
    `if the failing rule doesn't match supported rules then: ${expected} should be the validation error message`
  );
});

test('Generate error messages from Validation object with no user specified error message or default message', (assert) => {
  assert.plan(1);

  const validation = Validation.of(new ValidationState(5, ['required']));
  const rules: ValidationRules = {required: {value: true}};
  const expected = ["Couldn't find validation error message. Check rule definitions or the default error messages."];

  const actual = createErrorMessages(rules, {email: 'You missed this required field'})(validation);

  assert.deepEquals(
    actual,
    expected,
    `when there is no user specified or default error message for the failing rule then: ${expected} should be the validation error message`
  );
});
