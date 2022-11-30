import {RULE_NAMES} from './rule-validation-functions';

export type ValidationRuleName = typeof RULE_NAMES[number];

export type ValidationRules = {
  [key in ValidationRuleName]?: {value: boolean | number; errorMessage?: string};
};

export type ValidationValueType = string | number | (string | number)[] | Record<string, unknown>;

export type ValidationRuleOption = Exclude<ValidationRules[keyof ValidationRules], undefined>;

export type ValidatorFunction = (val: ValidationValueType) => boolean;

export {validate} from './validate';
