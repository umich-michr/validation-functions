import {ValidationRuleName, ValidationRuleOption, ValidatorFunction} from './index';
import {ValidationResult} from './Validation';
import {isEmail, isNotEmpty, isNotMoreThan} from './value-validation-functions';

export const RULE_NAMES = ['required', 'email', 'maxLength'] as const;

export const validationFnBuilder = (ruleName: ValidationRuleName, validatorFn: ValidatorFunction) => {
  return (validation: ValidationResult): ValidationResult => {
    const valid = validatorFn(validation.value);

    const failed = !valid ? validation.failed.concat(ruleName) : validation.failed;
    const successful = valid ? validation.successful.concat(ruleName) : validation.successful;
    return new ValidationResult(validation.value, failed, successful);
  };
};

const identityValidationFnBuilder = (ruleName: ValidationRuleName) => {
  return validationFnBuilder(ruleName, () => true);
};

type RuleApplicator = (options: ValidationRuleOption) => (validationResult: ValidationResult) => ValidationResult;

const required: RuleApplicator = (options: ValidationRuleOption) =>
  options.value ? validationFnBuilder('required', isNotEmpty) : identityValidationFnBuilder('required');

const email: RuleApplicator = (options: ValidationRuleOption) =>
  options.value ? validationFnBuilder('email', (val) => isEmail(val as string)) : identityValidationFnBuilder('email');

const maxLength: RuleApplicator = (options: ValidationRuleOption) =>
  validationFnBuilder('maxLength', isNotMoreThan(options.value as number));

const RULE_APPLICATORS: {[key in ValidationRuleName]: RuleApplicator} = {
  required,
  email,
  maxLength
};

export const getRuleApplicator = (
  ruleName: ValidationRuleName,
  options: ValidationRuleOption
): ((validationResult: ValidationResult) => ValidationResult) => {
  return RULE_APPLICATORS[ruleName] ? RULE_APPLICATORS[ruleName](options) : (v: ValidationResult) => v;
};
