export type ValidationValue = null | undefined | number| number[] | string | string[] | Date | Date[] | Object;

export interface ValidationRules {
    required?: { value: boolean };
    email?: { value: boolean };
    maxLength?: { value: number };
}

type ValidationRuleName = keyof ValidationRules;
type ValidationRuleOption = Exclude<ValidationRules[keyof ValidationRules], undefined>;

type ValidationResult = { [key in ValidationRuleName as string]: boolean };

type ValidationFn = (s: ValidationRuleOption) => (v: ValidationValue) => boolean;

type ValueValidator = (val: ValidationValue) => boolean;