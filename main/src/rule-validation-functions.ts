import {ValidationRuleName, ValidationRuleOption, ValidationRules, ValidatorFunction} from './index';
import {Validation, ValidationState} from './Validation';
import {isEmail, isNotEmpty, isNotMoreThan} from './value-validation-functions';
/* eslint-disable @typescript-eslint/no-explicit-any*/
export const RULE_NAMES = ['required', 'email', 'maxLength'] as const;

export function validationFnBuilder(ruleName: ValidationRuleName, validatorFn: ValidatorFunction) {
  return (validation: ValidationState): ValidationState => {
    const valid = validatorFn(validation.value);

    const failed = !valid ? validation.failed.concat(ruleName) : validation.failed;
    const successful = valid ? validation.successful.concat(ruleName) : validation.successful;
    return new ValidationState(validation.value, failed, successful);
  };
}

function identityValidationFnBuilder(ruleName: ValidationRuleName) {
  return validationFnBuilder(ruleName, () => true);
}

type RuleApplicator = (options: ValidationRuleOption) => (validationState: ValidationState) => ValidationState;

function getRuleApplicator(
  ruleName: ValidationRuleName,
  options: ValidationRuleOption
): (validationState: ValidationState) => ValidationState {
  const ruleApplicators: {[key in ValidationRuleName]: RuleApplicator} = {
    required: (options) =>
      options.value ? validationFnBuilder('required', isNotEmpty) : identityValidationFnBuilder('required'),
    email: (options) =>
      options.value
        ? validationFnBuilder('email', (val: string) => !val || isEmail(val))
        : identityValidationFnBuilder('email'),
    maxLength: (options) => validationFnBuilder('maxLength', isNotMoreThan(options.value as number))
  };
  return ruleApplicators[ruleName] ? ruleApplicators[ruleName](options) : (v: ValidationState) => v;
}

function applyRules(
  input: readonly [ValidationRuleName, ValidationRuleOption][],
  validation: Validation,
  index = 0
): Validation {
  if (index >= input.length) {
    return validation;
  }
  const [ruleName, ruleOptions] = input[index];
  const newValidation = validation.map(getRuleApplicator(ruleName, ruleOptions)) as Validation;

  return applyRules(input, newValidation, index + 1);
}

const VALIDATION_VALUE_TYPES = ['string', 'number', 'object', 'undefined'];
const isSupportedObject = (val: any) =>
  typeof val !== 'function' && typeof val !== 'symbol' && typeof val === 'object' && Object(val) === val;
const isSupportedType = (val: any) =>
  VALIDATION_VALUE_TYPES.includes(typeof val) || Array.isArray(val) || isSupportedObject(val);

export const validate =
  (rules: ValidationRules) =>
  (value: any): Validation => {
    if (!isSupportedType(value)) {
      throw Error('Can not validate input other than string, number, array or object');
    }
    const ruleEntries = Object.entries(rules) as [ValidationRuleName, ValidationRuleOption][];
    return applyRules(ruleEntries, Validation.of(value));
  };
