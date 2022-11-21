import {ValidationRuleName, ValidationRuleOption, ValidationRules} from './index';
import {Maybe} from './Maybe';
import {Validation} from './Validation';

export const DEFAULT_ERROR_MESSAGES: {[key in ValidationRuleName]: string} = {
  required: 'Field is required',
  email: 'This value should be a valid email.',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maxLength: 'This value is too long. It should have {value} characters or fewer.'
};

function tmpl(pattern: string) {
  return (data: ValidationRuleOption) =>
    (Object.keys(data) as Array<keyof ValidationRuleOption>).reduce(
      (str, key) => str.replace(new RegExp(`{${key}}`, 'g'), data[key] as string),
      pattern
    );
}

function createErrMsgFrom(rules: ValidationRules, defaultErrorMessages: {[key in ValidationRuleName]?: string}) {
  return (ruleName: ValidationRuleName) => {
    const msgMaybe = Maybe.of(rules[ruleName]?.errorMessage)
      .catchMap(() => Maybe.of(defaultErrorMessages[ruleName]))
      .map(tmpl)
      .ap(Maybe.of(rules[ruleName])) as Maybe<string>;

    return msgMaybe.fork(
      () => "Couldn't find validation error message. Check rule definitions or the default error messages.",
      (msg) => msg
    );
  };
}

export function createErrorMessages(
  rules: ValidationRules,
  defaultErrorMessages: {[key in ValidationRuleName]?: string} = DEFAULT_ERROR_MESSAGES
) {
  return (validation: Validation): string[] => {
    return validation.reduceFail((acc: string[], ruleName: ValidationRuleName) => {
      return acc.concat(createErrMsgFrom(rules, defaultErrorMessages)(ruleName));
    }, []) as string[];
  };
}