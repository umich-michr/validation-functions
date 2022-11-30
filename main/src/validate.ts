import {ValidationRuleName, ValidationRuleOption, ValidationRules, ValidationValueType} from './index';
import {Validation} from './Validation';
import {getRuleApplicator} from './rule-validation-functions';
import {typeofValue} from './value-validation-functions';

const applyRules = (
  input: readonly [ValidationRuleName, ValidationRuleOption][],
  validation: Validation,
  index = 0
): Validation => {
  if (index >= input.length) {
    return validation;
  }
  const [ruleName, ruleOptions] = input[index];
  const newValidation = validation.map(getRuleApplicator(ruleName, ruleOptions)) as Validation;

  return applyRules(input, newValidation, index + 1);
};

const isSupportedType = (val: unknown) => !['function', 'unknown'].includes(typeofValue(val));

export const validate = (rules: ValidationRules) => {
  return (value: ValidationValueType): Validation => {
    if (!isSupportedType(value)) {
      throw Error('Can not validate input other than string, number, array or object');
    }
    const ruleEntries = Object.entries(rules) as [ValidationRuleName, ValidationRuleOption][];
    return applyRules(ruleEntries, Validation.of(value));
  };
};
