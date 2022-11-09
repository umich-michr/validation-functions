import {validate} from "../../../main/src/rule-validation-functions";
import {Validation, ValidationState} from "../../../main/src/Validation";
import test, {Test} from "tape";
import {ValidationRuleName, ValidationRules} from "../../../main/src";

const RULE_NAME: ValidationRuleName = 'maxLength';
const VALIDATION_RULE: ValidationRules = {[RULE_NAME]:{value:2}};

const validateMaxLength: (val:any)=>Validation = validate(VALIDATION_RULE);
const expectedValidation = (val:unknown,result:boolean)=>new Validation(new ValidationState(val,[[RULE_NAME,result]]));

const VALID_INPUTS = [null, undefined,'',' ','  ','a','ab','0','10'];
const INVALID_INPUTS = ['   ', '  a', 'a  ',' a ','abc', '1234567890'];

function testInput(input: any[], expectedResult: boolean, assert: Test){
    assert.plan(input.length);

    input.forEach(val=>{
        const expected = expectedValidation(val,expectedResult).inspect();
        const actual = validateMaxLength(val).inspect();
        assert.equals(actual,expected, `${RULE_NAME} validation should return ${expectedResult} for value: ${JSON.stringify(val)} when rule option is: ${JSON.stringify(VALIDATION_RULE[RULE_NAME])}`);
    });
}

test(`${RULE_NAME} validation should return true for values: ${JSON.stringify(VALID_INPUTS)}`,(assert)=>{
    const expectedResult = true;
    testInput(VALID_INPUTS,expectedResult,assert);
});

test(`${RULE_NAME} validation should return false for values: ${JSON.stringify(INVALID_INPUTS)}`,(assert)=>{
    const expectedResult = false;
    testInput(INVALID_INPUTS,expectedResult,assert);
});