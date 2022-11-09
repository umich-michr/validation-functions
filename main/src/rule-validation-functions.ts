import {ValidationRuleName, ValidationRuleOption, ValidationRules, ValidatorFunction} from "./index";
import {Validation, ValidationState} from "./Validation";
import {isEmail, isNotEmpty, isLessThan} from "./value-validation-functions";
import {Maybe} from "./Maybe";
import {curry} from "./utils";

export function validationFnBuilder(ruleName: ValidationRuleName, validatorFn: ValidatorFunction) {
    return (validation: ValidationState): ValidationState => {
        const valid = validatorFn(validation.value);
        const results = validation.results.concat([[ruleName, valid]]);
        return {...validation, results};
    };
}

function identityValidationFnBuilder(ruleName: ValidationRuleName) {
    return validationFnBuilder(ruleName, () => true)
}

export function ignoreEmptyInput(validatorFn: ValidatorFunction){
    return (val: any)=> {
        return Maybe.of(val).map(validatorFn).fork(() => true, (val: any) => val)
    };
}

type RuleApplicator = (options: ValidationRuleOption) => (validationState: ValidationState) => ValidationState;

function getRuleApplicator(ruleName: ValidationRuleName, options: ValidationRuleOption): Maybe<(val: any) => ValidationState> {
    const ruleApplicators: { [key in ValidationRuleName]: RuleApplicator } = {
        required: options => options.value ? validationFnBuilder('required', isNotEmpty) : identityValidationFnBuilder('required'),
        email: options => options.value ? validationFnBuilder('email', ignoreEmptyInput(isEmail)) : identityValidationFnBuilder('required'),
        maxLength: options => validationFnBuilder('maxLength', ignoreEmptyInput(isLessThan(options.value as number))),
    }
    return Maybe.of(ruleApplicators[ruleName]).ap(Maybe.of(options)) as Maybe<(val: any) => ValidationState>;
}

function applyRules(input: [ValidationRuleName, ValidationRuleOption][], validation: Validation, index: number = 0): Validation {
    if (index >= input.length) {
        return validation;
    }
    const [ruleName, ruleOptions] = input[index];
    const newValidation = getRuleApplicator(ruleName, ruleOptions).ap(validation) as Validation;
    return applyRules(input, newValidation, (index + 1));
}

export const validate= curry((rules: ValidationRules, value: any): Validation => {
    const ruleEntries = Object.entries(rules) as [ValidationRuleName, ValidationRuleOption][];
    return applyRules(ruleEntries, Validation.of(value));
});