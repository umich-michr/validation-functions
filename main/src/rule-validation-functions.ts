import {ValidationRuleName, ValidationRuleOption, ValidationRules, ValidatorFunction} from './index';
import {Validation, ValidationState} from './Validation';
import {isEmail, isNotMoreThan, isNotEmpty} from './value-validation-functions';
import {Maybe} from './Maybe';
/* eslint-disable @typescript-eslint/no-explicit-any*/
export const RULE_NAMES = ['required', 'email', 'maxLength'] as const;

export function validationFnBuilder(ruleName: ValidationRuleName, validatorFn: ValidatorFunction) {
  return (validation: ValidationState): ValidationState => {
    const valid = validatorFn(validation.value);
    const results = validation.results.concat([[ruleName, valid]]);
    return {...validation, results};
  };
}

function identityValidationFnBuilder(ruleName: ValidationRuleName) {
  return validationFnBuilder(ruleName, () => true);
}

export function transformToIgnoreEmptyInput(validatorFn: ValidatorFunction) {
  return (val: any) => {
    return (Maybe.of(val).map(validatorFn) as Maybe<any>).fork(
      () => true,
      (val: any) => val
    );
  };
}

type RuleApplicator = (options: ValidationRuleOption) => (validationState: ValidationState) => ValidationState;

function getRuleApplicator(
  ruleName: ValidationRuleName,
  options: ValidationRuleOption
): Maybe<(val: any) => ValidationState> {
  const ruleApplicators: {[key in ValidationRuleName]: RuleApplicator} = {
    required: (options) =>
      options.value ? validationFnBuilder('required', isNotEmpty) : identityValidationFnBuilder('required'),
    email: (options) =>
      options.value
        ? validationFnBuilder('email', transformToIgnoreEmptyInput(isEmail))
        : identityValidationFnBuilder('email'),
    maxLength: (options) =>
      validationFnBuilder('maxLength', transformToIgnoreEmptyInput(isNotMoreThan(options.value as number)))
  };
  return Maybe.of(ruleApplicators[ruleName]).ap(Maybe.of(options)) as Maybe<(val: any) => ValidationState>;
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
  const newValidation = getRuleApplicator(ruleName, ruleOptions)
    .catchMap(() => {
      return Maybe.of((v: Validation) => v);
    })
    .ap(validation) as Validation;
  return applyRules(input, newValidation, index + 1);
}

const VALIDATION_VALUE_TYPES = ['string', 'number', 'object', 'undefined'];
const isSupportedObject = (val: any) =>
  typeof val !== 'function' && typeof val !== 'symbol' && typeof val === 'object' && Object(val) === val;
const isSupportedType = (val: any) =>
  VALIDATION_VALUE_TYPES.includes(typeof val) || Array.isArray(val) || isSupportedObject(val);

export const validate =
  (rules: ValidationRules) =>
  (value: string | number | any[] | Record<string, unknown>): Validation => {
    if (!isSupportedType(value)) {
      throw Error('Can not validate input other than string, number, array or object');
    }
    const ruleEntries = Object.entries(rules) as [ValidationRuleName, ValidationRuleOption][];
    return applyRules(ruleEntries, Validation.of(value));
  };
