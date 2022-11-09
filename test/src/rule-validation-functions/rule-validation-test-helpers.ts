import {Test} from "tape";
import {Validation, ValidationState} from "../../../main/src/Validation";
import {ValidationResults, ValidationRules} from "../../../main/src";
import {validate} from "../../../main/src/rule-validation-functions";

export function prepareValidationTestFor(testInput: any[], rules: ValidationRules, assert: Test) {
    return {
        setExpectation(results: ValidationResults) {
            const validateRule = validate(rules);
            return {
                run() {
                    const expectedValidationFn = (val: unknown) => new Validation(new ValidationState(val, results));
                    assert.plan(testInput.length);

                    testInput.forEach(val => {
                        const expected = expectedValidationFn(val).inspect();
                        const actual = validateRule(val).inspect();

                        assert.equals(actual, expected, `${JSON.stringify(rules)} rule validation should return ${expected} for value: ${JSON.stringify(val)}`);
                    });
                }
            }
        }
    }
}