import test from 'tape';
import {Validation, ValidationState} from "../../../main/src/Validation";
import {validate, validationFnBuilder} from "../../../main/src/rule-validation-functions";

test('maxLength validation should return true for empty values.',(assert)=>{
    const emptyStrings = [null, undefined,''];
    const applyValidationRules = validate({maxLength:{value:0}});

    assert.plan(emptyStrings.length);

    emptyStrings.forEach(val=>{
        const expectedState = new ValidationState(val,[['maxLength',true]]);
        const expected = new Validation(expectedState).inspect();
        const actual = applyValidationRules(val).inspect();
        assert.equals(actual,expected, `maxLength validation should return ${expectedState.results[0][1]} for value: ${JSON.stringify(val)}`);
    });
});
