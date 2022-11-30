import test from 'tape';
import {isEmail} from '../../../main/src/value-validation-functions';

const VALID_INPUTS = [
  null,
  undefined,
  'a@b.com',
  'jdoe@michr.med.umich.edu',
  'SoMebody-_123@umich.edu',
  'a-+124@b.com',
  '_a----+124@b.com'
];
const INVALID_INPUTS = [
  [],
  {},
  '  ',
  ' a ',
  'a',
  'a.c',
  'a@',
  '@',
  '@c',
  'a@c',
  '@c.',
  '@c.c',
  '@c.c.',
  'a@c.c.',
  'a @b.com',
  ' a@b.com',
  'a@b.com ',
  ' a@b.com ',
  'a@b@c',
  'a@b@c.com'
];

test('isEmail Tests - should return true when input is a valid email. (not meeting RFC 5322 standard, see code JsDoc))', (assert) => {
  assert.plan(VALID_INPUTS.length);

  VALID_INPUTS.forEach((input) => {
    assert.true(isEmail(input as string), `should return true for ${input}`);
  });
});

test('isEmail Tests - should return false when input is not a valid email. (not meeting RFC 5322 standard, see code JsDoc))', (assert) => {
  assert.plan(INVALID_INPUTS.length);

  INVALID_INPUTS.forEach((input) => {
    assert.false(isEmail(input as string), `should return false for ${input}`);
  });
});
