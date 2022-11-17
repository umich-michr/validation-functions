import test from 'tape';
import {validate} from '../../../main/src/rule-validation-functions';

test('Given a non-existent rule When validate is called on a value Then validation result should be returned as is', (assert) => {
  const input = '  ';
  const expected = '{"isValid":true,"validation":{"value":"  ","failed":[],"successful":[]}}';
  // @ts-ignore
  const actual = validate({a: {value: true}})(input);

  assert.true(actual.isValid, 'non-existent rule validation should return valid: true');
  assert.equals(JSON.stringify(actual), expected, 'non-existent rule validation should return no results.');
  assert.end();
});
