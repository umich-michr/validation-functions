import test from 'tape';
import {Maybe} from '../../main/src/Maybe';
import {ValidationFn, ValidationRuleName, ValidationRuleOption, ValidationValue, ValueValidator} from "../../main/src";
import {Validation, ValidationInput} from "../../main/src/Validation";

// class Validation implements Monad<ValidationValue>{
//     private readonly value: ValidationValue;
//     private readonly valid: boolean = true;
//     private readonly errorMsg: string[];
//
//     constructor(val: ValidationValue, valid: boolean = true, msg: string[] = []) {
//         this.value = val;
//         this.valid = valid;
//         this.errorMsg = msg;
//     }
//
//     static of(val: ValidationValue, valid: boolean = true, msg: string[] = []) {
//         return new Validation(val, valid, msg);
//     }
//
//     map(f: ValueValidator): Validation {
//         const validation = Validation.of(this.value, f(this.value));
//         // console.log(`Validation at the end of map is: ${JSON.stringify(validation)} for value: ${JSON.stringify(this.value)} isValid: ${f(this.value)}`);
//         return validation;
//     }
//
//     end() {
//         // console.log(this.valid);
//         if(!this.valid) {
//             this.map = () => {
//                 return this;
//             };
//         }
//         return this;
//     }
//
//     fork(onValid:(v:any)=>any, onInvalid:(v:any)=>any){
//         return this.valid?onValid(this.valid):onInvalid(this.valid);
//     }
//
//     ap(val: Monad<any>): Monad<any> {
//         return undefined as unknown as Monad<any>;
//     }
//
//     bind(fn: (val: ValidationValue) => Monad<any>): Monad<any> {
//         return undefined as unknown as Monad<any>;
//     }
// }

function isEmptyString(str: string) {
    return !str.trim().length;
}

function isEmptyArray(arr: Array<string | number | Date>) {
    return !arr?.length;
}

function isEmptyObject(obj: Object) {
    return !Object.keys(obj).length;
}

function isNotEmpty(val:ValidationValue){
    if(!val){
        return false;
    }else if(typeof val === 'string'){
        return !isEmptyString(val);
    }else if(Array.isArray(val)){
        return !isEmptyArray(val);
    }else if (!Array.isArray(val) && typeof val === 'object'){
        return !isEmptyObject(val);
    }
    else{
        return true;
    }
}

function isNotEmail(str: string) {
    const re = /(^$|^[^\s@]+@[^\s@]+\.[^\s@]+$)/;
    return !re.test(str);
}

function isTooLong(maxLength: number) {
     // console.log(`Passed string: ${str} maxLength: ${maxLength} validation: ${str.length <= maxLength}`);
    return (str: string)=> str.length > maxLength;
}

function validationApplicator(ruleName: ValidationRuleName) {
    return (valueValidator: (val:any)=>boolean)=>(validation: ValidationInput):ValidationInput=>{
        const valid=valueValidator(validation.value);
        return { ...validation, results: validation.results.concat([[ruleName,valid]])};
    };
}
const identityValidationApplicator = (ruleName: ValidationRuleName)=>validationApplicator(ruleName)(v=>true);

const ruleApplicators:{
    [key in ValidationRuleName]: (options: ValidationRuleOption)=>(validation: ValidationInput)=>ValidationInput
} = {
    required: options => options.value ? validationApplicator('required')(isNotEmpty):identityValidationApplicator('required'),
    email: options => options.value ? validationApplicator('email')(isNotEmail):identityValidationApplicator('required'),
    maxLength: options => validationApplicator('maxLength')(isTooLong(options.value as number)),
}


// function validateRequired(val: ValidationValue): boolean/*Validation*/ {
//     return Validation.of(val)
//         .map(val => !!val).end()
//         .map(val => (typeof val === 'string')?!isEmptyString(val as string):true).end()
//         .map(val => Array.isArray(val) ? !isEmptyArray(val as Array<any>):true).end()
//         .map(val => (!Array.isArray(val) && typeof val === 'object') ? !isEmptyObject(val as Object): true)
//         .fork(v=>v,v=>v);
// }

// const validationFns: { [key in ValidationRuleName as string]: ValidationFn } = {
//     required: options => val => options.value ? validateRequired(val) : true,
//     email: options => val => options.value ? isEmail(val as string) : true,
//     maxLength: options => val => isLessThan(val as string, options.value as number)
// };

// const x = Maybe.of(ruleApplicators['required']);
// const t = x.ap(Maybe.of({value:true})) as Maybe<any>;
// console.log(ruleApplicators['required']({value:true}));
// console.log(Validation.of(5).inspect());
// console.log(t.ap(Validation.of(5)).inspect());
// console.log(ruleApplicators['required']({value:true})({"value":5,"results":[]}));

function applyRule(ruleName: ValidationRuleName) {
    return (ruleOption: ValidationRuleOption)=>(val: ValidationValue): Validation => {
        // console.log(`applicator for ${ruleName} is ${ruleApplicators[ruleName]}`);
        const validatorFnMaybe = Maybe.of(ruleApplicators[ruleName]);
        const ruleOptionMaybe = Maybe.of(ruleOption);
        const valueValidation = Validation.of(val);

        // console.log(`validatorFnMaybe: ${validatorFnMaybe.inspect()}`);
        // console.log(`ruleOptionMaybe: ${ruleOptionMaybe.inspect()}`);
        // console.log(`valueValidation: ${valueValidation.inspect()}`);

        return validatorFnMaybe
            .ap(ruleOptionMaybe)
            .ap(valueValidation) as Validation;
    }
}

function applyRules(input:[ValidationRuleName, ValidationRuleOption][], val: ValidationValue, index:number=0, out:Validation[]=[]): Validation[]{
    if(index>=input.length) {
        return out;
    }
    const [ruleName, ruleSettings] = input[index];
    return applyRules(input, val, (index+1), out.concat(applyRule(ruleName)(ruleSettings)(val)));
}

// console.log('Hi '+JSON.stringify(applyRules([['required', {value: true}], ['maxLength', {value: 2}]], 'Michigan')));

test.only('',(assert)=>{
    const rules = {required:{value:true},email:{value:true},maxLength:{value:2}};
    const actual = applyRules(Object.entries(rules) as [ValidationRuleName, ValidationRuleOption][],5);

    console.log(JSON.stringify(actual,null,0));

    assert.end();
});


// test('',(assert)=>{
//
// });

test('applyRule should create the validator function using the rule and apply it to the value to return a Validation encapsulating the result of the validation',(assert)=>{
    let actual = applyRule('required')({value:true})(5);
    let expected = 'Validation({"value":5,"results":[["required",true]]})';
    assert.equals(actual.inspect(),expected);
    console.log(actual.inspect(),null,0);

    // actual = applyRule('required')({value:true})({});
    // expected = 'Validation({"value":{"value":{},"results":[["required",false]]},"results":[]})';
    // assert.equals(actual.inspect(),expected);

    // actual = applyRule('required')({value:true})([]);
    // expected = '{"valid":false,"value":[],"errorMsg":[]}';
    // assert.equals(JSON.stringify(actual),expected);
    //
    // actual = applyRule('required')({value:true})('');
    // expected = '{"valid":false,"value":"","errorMsg":[]}';
    // assert.equals(JSON.stringify(actual),expected);
    //
    // actual = applyRule('required')({value:true})(undefined);
    // expected = '{"valid":false,"errorMsg":[]}';
    // assert.equals(JSON.stringify(actual),expected);
    //
    // actual = applyRule('required')({value:true})(null);
    // expected = '{"valid":false,"value":null,"errorMsg":[]}';
    // assert.equals(JSON.stringify(actual),expected);

    assert.end();
});


// const buildValidator = (fns: typeof validationFns) => (rules: ValidationRules = {}) => (val: ValidationValue): ValidationResult => {
//     // console.log(`called buildValidator with fns: ${fns}, rules: ${rules}, val: ${val}`);
//     return Object.assign({}, ...Object.entries(rules).map((ruleTuple) => {
//         const [ruleName, ruleSettings] = ruleTuple as [ValidationRuleName, ValidationRuleOption];
//         console.log(`Adding ${ruleName} for settings: ${JSON.stringify(ruleSettings)} validation result: ${JSON.stringify(fns[ruleName](ruleSettings)(val))}`);
//         return {[ruleName]: fns[ruleName](ruleSettings)(val)};
//     }));
// };
// const validate = (rules?: ValidationRules) => (value: ValidationValue) => {
//     const rulesMaybe= Maybe.of(rules);
//     console.log(`Rules ${JSON.stringify(rules)} maybe: ${rulesMaybe.inspect()}`);
//     return rulesMaybe.map(buildValidator(validationFns)).ap(Validation.of(value));
// }
//
// const selectedValue = {id: 1, value: 'MI', type: 'State', name: 'Michigan'};
// const valueSelector: ValueSelector<typeof selectedValue, string> = (o) => o.name;
// const rules = {/*required: {value: true},*/ maxLength: {value: 2}};
//
// test('Should validate a Maybe using a validation rule', (assert) => {
//     const value = valueSelector(selectedValue);
//     const actual = validate(rules)(value);
//     const expected = { valid: true, value: 'Michigan', errorMsg: [] };
//     console.log(JSON.stringify(actual));
//     assert.deepEqual(actual, expected);
// });