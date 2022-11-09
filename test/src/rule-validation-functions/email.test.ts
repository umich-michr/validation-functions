import test, {Test} from "tape";
import {validate} from "../../../main/src/rule-validation-functions";
import {Validation, ValidationState} from "../../../main/src/Validation";
import {ValidationRuleName, ValidationRules} from "../../../main/src";


const RULE_NAME: ValidationRuleName = 'email';
const VALIDATION_RULE: ValidationRules = {[RULE_NAME]:{value:true}};

const validateEmail: (val:any)=>Validation = validate(VALIDATION_RULE);
const expectedValidation = (val:unknown,result:boolean)=>new Validation(new ValidationState(val,[[RULE_NAME,result]]));

const VALID_INPUTS = [null, undefined, '', 'a@b.com','jdoe@michr.med.umich.edu','SoMebody-_123@umich.edu', 'a-+124@b.com', '_a----+124@b.com'];
const INVALID_INPUTS = ['  ', ' a ', 'a', 'a.c', 'a@', '@', '@c', 'a@c', '@c.', '@c.c', '@c.c.', 'a@c.c.', 'a @b.com', ' a@b.com', 'a@b.com ', ' a@b.com ', 'a@b@c', 'a@b@c.com'];

function testInput(input: any[], expectedResult: boolean, assert: Test){
    assert.plan(input.length);

    input.forEach(val=>{
        const expected = expectedValidation(val,expectedResult).inspect();
        const actual = validateEmail(val).inspect();
        assert.equals(actual,expected, `${RULE_NAME} validation should return ${expectedResult} for value: ${JSON.stringify(val)} when rule option is: ${JSON.stringify(VALIDATION_RULE[RULE_NAME])}`);
    });
}

test(`${RULE_NAME} validation should return false for non-email values: ${JSON.stringify(INVALID_INPUTS)}`,(assert)=>{
    const expectedResult = false;
    testInput(INVALID_INPUTS,expectedResult,assert);
});

test(`${RULE_NAME} validation should return true for valid email addresses: ${JSON.stringify(VALID_INPUTS)}`,(assert)=>{
    const expectedResult = true;
    testInput(VALID_INPUTS,expectedResult,assert);
});