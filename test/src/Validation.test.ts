import test from 'tape';
import {Validation, ValidationState} from "../../main/src/Validation";

test('Validation should create a validation object using a simple value',(assert)=>{
    const value = 5;
    const actual = Validation.of(value);
    const expected = `Validation(${JSON.stringify(new ValidationState(value))})`;

    assert.equals(actual.inspect(),expected);
    assert.end();
});

test('Validation should be valid when all of the validation result values are set to true',(assert)=> {
    const allTrue = new ValidationState('jdoe@gmail.com', [['required',true],['email',true],['maxLength', true]]);
    const noValidationResult = new ValidationState('jdoe@gmail.com');
    const functionInput = ()=>{};

    [allTrue,noValidationResult,functionInput].forEach(input=>{
        const actual=new Validation(input);
        assert.true(actual.isValid, 'should be valid when all validation results are true or the input is a function');

    });
    assert.end();
});

test('Validation should be invalid when any of the validation result values are set to false',(assert)=> {
    const onlyOneValidationFalse = new ValidationState('', [['required',false]]);
    const allFalse = new ValidationState('', [['required',false],['email',false],['maxLength', false]]);
    const onlyTheFirstFalse = new ValidationState('a', [['required',false],['email',true],['maxLength', true]]);
    const onlyTheSecondFalse = new ValidationState('a', [['required',true],['email',false],['maxLength', true]]);
    const onlyTheThirdFalse = new ValidationState('a', [['required',true],['email',true],['maxLength', false]]);
    const onlyTheFirstTwoFalse = new ValidationState('a', [['required',false],['email',false],['maxLength', true]]);
    const onlyTheLastTwoFalse = new ValidationState('a', [['required',true],['email',false],['maxLength', false]]);

    [onlyOneValidationFalse,allFalse,onlyTheFirstFalse,onlyTheSecondFalse,onlyTheThirdFalse,onlyTheFirstTwoFalse,onlyTheLastTwoFalse]
        .forEach(input=>{
            const actual = new Validation(input);
            assert.false(actual.isValid, 'should be invalid when any number of validation results are set to false');
        });

    assert.end();
});

test('Given a function that will return a monad When bind is called Then the function should be applied to the wrapped value and the monad return value should be returned',(assert)=>{
    const fn = (a:ValidationState)=>new Validation(new ValidationState(a.value*5));
    const actual = Validation.of(5).bind(fn);
    const expected='Validation({"value":25,"results":[]})';

    assert.equals(actual.inspect(),expected);
    assert.end();
});

test('Given a function that will return a new value When map is called Then the function should be applied to the wrapped value and Validation object wrapping the new value should be returned',(assert)=>{
    const fn = (a:ValidationState)=>new ValidationState(a.value*5);
    const actual = Validation.of(5).map(fn);
    const expected='Validation({"value":25,"results":[]})';

    assert.equals(actual.inspect(),expected);
    assert.end();
});

test('Given wrapped value is a function that will return a new value and a Monad is passed When ap is called Then the wrapped function should be applied to the wrapped value of the Monad and a Monad with the function\'s output value should be returned',(assert)=>{
    const fn = (a:ValidationState)=>new ValidationState(a.value*5);
    const actual = new Validation(fn).ap(Validation.of(5));
    const expected='Validation({"value":25,"results":[]})';

    assert.equals(actual.inspect(),expected);
    assert.end();
});