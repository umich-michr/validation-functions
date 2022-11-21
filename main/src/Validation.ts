import {Monad} from './functional-interfaces';
import {ValidationRuleName} from './index';

/* eslint-disable @typescript-eslint/no-explicit-any*/
export class ValidationState {
  readonly value: any;
  readonly failed: ValidationRuleName[];
  readonly successful: ValidationRuleName[];
  constructor(val: any, failed: ValidationRuleName[] = [], successful: ValidationRuleName[] = []) {
    this.value = val;
    this.failed = failed;
    this.successful = successful;
  }
}

export class Validation implements Monad<ValidationState | ((val: any) => any)> {
  private readonly validation: ValidationState | ((val: any) => any);
  readonly isValid: boolean = true;
  // private readonly currentValidation: ValidationRuleName;
  constructor(val: ValidationState | ((val: any) => any)) {
    this.validation = val;
    if (typeof val !== 'function') {
      this.isValid = val.failed.length === 0; //!val.results.find(([, result]) => !result);
    }
  }
  static of(val: any | ((val: any) => any)) {
    return val instanceof ValidationState || typeof val === 'function'
      ? new Validation(val)
      : new Validation(new ValidationState(val));
  }
  inspect() {
    if (typeof this.validation === 'function') {
      return `Validation(${this.validation.toString()})`;
    }
    return `Validation(${JSON.stringify(this.validation)})`;
  }
  ap(otherMonad: Monad<any>): Monad<any> {
    if (typeof this.validation === 'function') {
      return otherMonad.map(this.validation);
    }
    throw new Error("If validation doesn't wrap a function then it can not be applied on another Monad");
  }

  bind(fn: (val: ValidationState) => Monad<any>): Monad<any> {
    if (typeof this.validation === 'function') {
      return this;
    }
    return fn(this.validation);
  }

  map(fn: (val: ValidationState) => any): Monad<any> {
    return this.bind((val) => new Validation(fn(val)));
  }

  reduceFail<T>(fn: (acc: T, element: ValidationRuleName) => T, accInitial: T): T | undefined {
    if (typeof this.validation !== 'function') {
      let acc = accInitial;
      this.validation.failed.forEach((res) => {
        acc = fn(acc, res);
      });
      return acc;
    }
    return;
  }
}
