import test from "tape";
import {ValidationRuleName, ValidationRules} from "../../../main/src";
import {prepareValidationTestFor} from "./rule-validation-test-helpers";

const RULE_NAME: ValidationRuleName = 'email';
const VALIDATION_RULE: ValidationRules = {[RULE_NAME]:{value:true}};

const VALID_INPUTS = [null, undefined, '', 'a@b.com','jdoe@michr.med.umich.edu','SoMebody-_123@umich.edu', 'a-+124@b.com', '_a----+124@b.com'];
const INVALID_INPUTS = ['  ', ' a ', 'a', 'a.c', 'a@', '@', '@c', 'a@c', '@c.', '@c.c', '@c.c.', 'a@c.c.', 'a @b.com', ' a@b.com', 'a@b.com ', ' a@b.com ', 'a@b@c', 'a@b@c.com'];

test(`${RULE_NAME} validation should return false for non-email values: ${JSON.stringify(INVALID_INPUTS)}`,(assert)=>{
    const expectedResult = false;

    prepareValidationTestFor(INVALID_INPUTS, VALIDATION_RULE, assert)
        .setExpectation([[RULE_NAME,expectedResult]])
        .run();
});

test(`${RULE_NAME} validation should return true for valid email addresses: ${JSON.stringify(VALID_INPUTS)}`,(assert)=>{
    const expectedResult = true;

    prepareValidationTestFor(VALID_INPUTS, VALIDATION_RULE, assert)
        .setExpectation([[RULE_NAME,expectedResult]])
        .run();
});