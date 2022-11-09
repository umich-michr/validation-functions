import {ruleNames} from "./value-validation-functions";

type ValidationRuleName = typeof ruleNames[number];

export type ValidationRules = {
    [key in ValidationRuleName]?: { value: boolean | number; };
};

export type ValidationResults = [ValidationRuleName,boolean][];

type ValidationRuleOption = Exclude<ValidationRules[keyof ValidationRules], undefined>;
export type ValidatorFunction=(val:any)=>boolean;