import test from "tape";
import {ValidationState} from "../../../main/src/Validation";
import {ruleNames} from "../../../main/src/value-validation-functions";
import {validationFnBuilder} from "../../../main/src/rule-validation-functions";

const input = 'a@b.com';
const alwaysTrueValidator=(val: any) => true;

test(`Given a ruleName in ${ruleNames}
              And a fn of ${alwaysTrueValidator}
             When validationFnBuilder is called
             Then a fn of type (state: ValidationState)=>ValidationState should be returned
              And the resulting function should always return validation result to be true for all ruleNa,es.`, (assert) => {
    const validationState = new ValidationState(input);

    assert.plan(ruleNames.length);

    ruleNames.forEach(rule=>{
        const expected = { value: input, results: [ [ rule, true ] ] };
        const actual = validationFnBuilder(rule, alwaysTrueValidator)(validationState);
        assert.deepEquals(actual,expected, `value: ${input} should pass ${rule} validation` );
    });
});