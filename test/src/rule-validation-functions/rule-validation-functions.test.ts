import test from 'tape';
import {RULE_NAMES} from '../../../main/src/rule-validation-functions';
import {testValidationFor} from './rule-validation-test-helpers';
import {validate, ValidationRuleName} from '../../../main/src';

//validation rules are generated from the constant ruleNames to makes ure whatever rules will be added or discarded can be caught by tests.
const VALIDATION_RULES = RULE_NAMES.reduce(
  (acc, rule) => {
    if (rule === 'required') {
      return {...acc, [rule]: {value: true}, b: {something: 1}};
    } else if (rule === 'maxLength') {
      return {...acc, [rule]: {value: 14}, c: {other: ''}};
    }
    return {...acc, [rule]: {value: true}};
  },
  {a: {}}
);

test('Given a set of rules with non-existent rules Then validation result should be returned with the results of all validations', (assert) => {
  const INPUTS = [null, undefined, '', [], {}, 'jdoe@gmail.com', 'tooLong@gmail.com', 'aa']; //toString() for [] is empty string and for that reason email validation returns true
  const EXPECTED_RESULTS: [ValidationRuleName, boolean][][] = [
    [
      ['required', false],
      ['email', true],
      ['maxLength', true]
    ],
    [
      ['required', false],
      ['email', true],
      ['maxLength', true]
    ],
    [
      ['required', false],
      ['email', true],
      ['maxLength', true]
    ],
    [
      ['required', false],
      ['email', false],
      ['maxLength', true]
    ],
    [
      ['required', false],
      ['email', false],
      ['maxLength', true]
    ],
    [
      ['required', true],
      ['email', true],
      ['maxLength', true]
    ],
    [
      ['required', true],
      ['email', true],
      ['maxLength', false]
    ],
    [
      ['required', true],
      ['email', false],
      ['maxLength', true]
    ]
  ];

  // @ts-ignore - ignored because we are testing input with fields not recognized by Typescript type.
  testValidationFor(INPUTS, VALIDATION_RULES).setExpectation(EXPECTED_RESULTS).assert(assert);
});

test('When unsupported types are passed as argument an exceptions should be thrown', (assert) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const INPUTS = [() => {}, Symbol()];
  assert.plan(INPUTS.length);

  INPUTS.forEach((input) => {
    // @ts-ignore
    assert.throws(() => validate({})(input), Error, `${input.toString()} should throw error.`);
  });
});
