import {ValidationValue, ValueValidator} from "./index";
import {Monad} from "./functional-interfaces";

type ValidationRuleName = 'required'|'email'|'maxLength';
type ValidationRuleOption = {value: boolean};

type ValidationRules = {
    [key in ValidationRuleName]?:ValidationRuleOption;
}

type  ValidationResults = {
    [key in ValidationRuleName]?:boolean;
}

export class ValidationInput {
    readonly value:ValidationValue;
    readonly results:[ValidationRuleName,boolean][];
    constructor(val:ValidationValue, results:[ValidationRuleName,boolean][]=[]){
        this.value=val;
        this.results=results;
    }
}

export class Validation implements Monad<ValidationValue>{
    private readonly validation: ValidationInput|((val: any) => any);
    // private readonly currentValidation: ValidationRuleName;
    constructor(val: ValidationInput|((val: any) => any)){
        this.validation=val;
    }
    static of<T>(val: ValidationValue|((val: any) => any)) {
        return new Validation({value:val, results:[]});
    }
    inspect() {
        if(typeof this.validation==='function'){
            return `Validation(${this.validation.toString()})`;
        }
        return `Validation(${JSON.stringify(this.validation)})`;
    }
    isValid(){
        if(typeof this.validation==='function'){
            return true;
        }
        return Object.entries(this.validation.results).find(([ruleName,result])=>!result)?false:true;
    }
    ap(otherMonad: Monad<any>): Monad<any> {
        if(typeof this.validation==='function') {
            return otherMonad.map(this.validation);
        }
        throw new Error('If validation doesn\'t wrap a function then it can not be applied on another Monad');
    }

    bind(fn: (val: ValidationInput) => Monad<any>): Monad<any> {
        if(typeof this.validation==='function'){
            return this;
        }
        return fn(this.validation);
    }

    map(fn: (val: ValidationInput) => any): Monad<any> {
        return this.bind(val => new Validation(fn(val)));
    }

    emit(): ValidationInput|((val: any) => any) {
        return this.validation;
    }
}