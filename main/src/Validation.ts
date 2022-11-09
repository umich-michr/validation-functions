import {Monad} from "./functional-interfaces";
import {ValidationResults, ValidationRuleName} from "./index";

export class ValidationState {
    readonly value:any;
    readonly results:ValidationResults;
    constructor(val:any, results:ValidationResults=[]){
        this.value=val;
        this.results=results;
    }
}

export class Validation implements Monad<ValidationState|((val: any) => any)>{
    private readonly validation: ValidationState|((val: any) => any);
    readonly isValid: boolean = true;
    // private readonly currentValidation: ValidationRuleName;
    constructor(val: ValidationState|((val: any) => any)){
        this.validation=val;
        if(typeof val !=='function') {
           this.isValid = !val.results.find(([, result]) => !result);
        }
    }
    static of<T>(val: any|((val: any) => any)) {
        return new Validation({value:val, results:[]});
    }
    inspect() {
        if(typeof this.validation==='function'){
            return `Validation(${this.validation.toString()})`;
        }
        return `Validation(${JSON.stringify(this.validation)})`;
    }
    ap(otherMonad: Monad<any>): Monad<any> {
        if(typeof this.validation==='function') {
            return otherMonad.map(this.validation);
        }
        throw new Error('If validation doesn\'t wrap a function then it can not be applied on another Monad');
    }

    bind(fn: (val: ValidationState) => Monad<any>): Monad<any> {
        if(typeof this.validation==='function'){
            return this;
        }
        return fn(this.validation);
    }

    map(fn: (val: ValidationState) => any): Monad<any> {
        return this.bind(val => new Validation(fn(val)));
    }
}