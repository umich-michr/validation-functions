import {RULE_NAMES} from './rule-validation-functions';

export type ValidationRuleName = typeof RULE_NAMES[number];

export type ValidationRules = {
  [key in ValidationRuleName]?: {value: boolean | number};
};

export type ValidationResults = [ValidationRuleName, boolean][];

export type ValidationRuleOption = Exclude<ValidationRules[keyof ValidationRules], undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidatorFunction = (val: any) => boolean;

export {validate} from './rule-validation-functions';
