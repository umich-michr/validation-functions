import {ValidationRuleName, ValidationRuleOption, ValidationRules} from './index';
import {Maybe} from './Maybe';
import {Validation} from './Validation';

export const DEFAULT_ERROR_MESSAGES: {[key in ValidationRuleName]: string} = {
  required: 'Field is required',
  email: 'This value should be a valid email.',
  maxLength: 'This value is too long. It should have {value} characters or fewer.'
};

const tmpl = (data: ValidationRuleOption) => {
  return (pattern: string) =>
    (Object.keys(data) as Array<keyof ValidationRuleOption>).reduce(
      (str, key) => str.replace(new RegExp(`{${key}}`, 'g'), data[key] as string),
      pattern
    );
};

const createErrMsgFrom = (rules: ValidationRules, defaultErrorMessages: {[key in ValidationRuleName]?: string}) => {
  return (ruleName: ValidationRuleName) => {
    const msgMaybe = Maybe.of(rules[ruleName])
      .map(tmpl)
      .ap(Maybe.of(rules[ruleName]?.errorMessage ?? defaultErrorMessages[ruleName])) as Maybe<string>;

    return msgMaybe.fork(
      () => "Couldn't find validation error message. Check rule definitions or the default error messages.",
      (msg) => msg
    ) as string;
  };
};

export const createErrorMessages = (
  rules: ValidationRules,
  defaultErrorMessages: {[key in ValidationRuleName]?: string} = DEFAULT_ERROR_MESSAGES
) => {
  return (validation: Validation): string[] => {
    return validation.reduceFail((acc: string[], ruleName: ValidationRuleName) => {
      return acc.concat(createErrMsgFrom(rules, defaultErrorMessages)(ruleName));
    }, []) as string[];
  };
};
