import test from "tape";
import {ValidationRuleName, ValidationRules} from "../../../main/src";
import {prepareValidationTestFor} from "./rule-validation-test-helpers";

const RULE_NAME: ValidationRuleName = 'required';
const VALIDATION_RULE: ValidationRules = {[RULE_NAME]:{value:true}};

const INVALID_INPUTS = [null, undefined,'','   ',[],{}];
const VALID_INPUTS = ['a', 5, ()=>{}, ['a'],{a:1}];

test(`${RULE_NAME} validation should return false for empty values: ${JSON.stringify(INVALID_INPUTS)}`,(assert)=>{
    const expectedResult = false;

    prepareValidationTestFor(INVALID_INPUTS, VALIDATION_RULE, assert)
        .setExpectation([[RULE_NAME,expectedResult]])
        .run();
});

test(`${RULE_NAME} validation should return true for non-empty values: ${JSON.stringify(VALID_INPUTS)}`,(assert)=>{
    const expectedResult = true;

    prepareValidationTestFor(VALID_INPUTS, VALIDATION_RULE, assert)
        .setExpectation([[RULE_NAME,expectedResult]])
        .run();
});