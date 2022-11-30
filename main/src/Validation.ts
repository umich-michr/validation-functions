/* eslint-disable @typescript-eslint/no-explicit-any */
import {Monad} from './functional-interfaces';
import {ValidationRuleName, ValidationValueType} from './index';

export class ValidationResult {
  readonly value: ValidationValueType;
  readonly failed: ValidationRuleName[];
  readonly successful: ValidationRuleName[];
  constructor(val: ValidationValueType, failed: ValidationRuleName[] = [], successful: ValidationRuleName[] = []) {
    this.value = val;
    this.failed = failed;
    this.successful = successful;
  }
}

export class Validation implements Monad {
  private readonly validation: ValidationResult | ((val: any) => any);
  readonly isValid: boolean = true;
  constructor(val: ValidationResult | ((val: any) => any)) {
    this.validation = val;
    if (typeof val !== 'function') {
      this.isValid = val.failed.length === 0;
    }
  }

  static of(val: ValidationValueType | ValidationResult | ((val: any) => any)) {
    return val instanceof ValidationResult || typeof val === 'function'
      ? new Validation(val)
      : new Validation(new ValidationResult(val));
  }

  inspect() {
    if (typeof this.validation === 'function') {
      return `Validation(${this.validation.toString()})`;
    }
    return `Validation(${JSON.stringify(this.validation)})`;
  }

  ap(otherMonad: Monad): Monad {
    if (typeof this.validation === 'function') {
      return otherMonad.map(this.validation) as Monad;
    }
    throw new Error("If validation doesn't wrap a function then it can not be applied on another Monad");
  }

  bind(fn: (val: any) => Monad): Monad {
    if (typeof this.validation === 'function') {
      return this;
    }
    return fn(this.validation);
  }

  map(fn: (val: any) => any): Monad {
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
