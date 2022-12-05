//disabled inspection and eslint for redundant escape because regex is incorrectly identified.
/* eslint-disable no-useless-escape */
// noinspection RegExpRedundantEscape

import {ValidationValueType} from './index';

const isEmptyString = (str: string): boolean => {
  return !str.trim().length;
};

const isEmptyArray = (arr: Array<string | number | Date>): boolean => {
  return !arr.length;
};

const isEmptyObject = (obj: Record<string, unknown>): boolean => {
  return !Object.keys(obj).length;
};

const VALUE_TYPES = ['undefined', 'null', 'string', 'number', 'array', 'object', 'function', 'unknown'] as const;
type ValidationType = typeof VALUE_TYPES[number];

export const typeofValue = (val: unknown): ValidationType => {
  return val === undefined
    ? 'undefined'
    : val === null
    ? 'null'
    : typeof val === 'string'
    ? 'string'
    : typeof val === 'number'
    ? 'number'
    : Array.isArray(val)
    ? 'array'
    : typeof val === 'function'
    ? 'function'
    : Object(val) === val
    ? 'object'
    : 'unknown';
};

export const isNotEmpty = (val: unknown): boolean => {
  switch (typeofValue(val)) {
    case 'string':
      return !isEmptyString(val as string);
    case 'array':
      return !isEmptyArray(val as []);
    case 'object':
      return !isEmptyObject(val as Record<string, unknown>);
    case 'undefined':
    case 'null':
      return false;
    case 'number':
    case 'function':
      return true;
    default:
      throw new Error("typeofValue returned unknown type which we don't know how to check if it's empty or not");
  }
};

/**
 * False returned if the email address is not following the expected format
 * Regex is courtesy of: David Lott at https://www.regexlib.com/RETester.aspx?regexp_id=88 (tweaked it to pass our tests)
 * @param addr Email address in string format
 */
export const isEmail = (addr: string): boolean => {
  if (!addr) {
    return true;
  }
  const re = new RegExp(/^([\w\-\+\.]+)@((\[([0-9]{1,3}\.){3}[0-9]{1,3}\])|(([\w\-]+\.)+)([a-zA-Z]{2,4}))$/gim);
  return re.test(addr);
};

export const isNotMoreThan = (maxLength: number) => {
  return (val: ValidationValueType): boolean => {
    if (isNaN(maxLength)) {
      throw Error('You should specify maxLength value as number. e.g.: {maxLength: {value: 5}');
    }
    //ts-ignore are added from switch case statemnt because typescript compiler couldn't understand switch case was making sure that val.toString() will not run into error.
    switch (typeofValue(val)) {
      case 'string':
      case 'array':
        // @ts-ignore
        return val.length <= maxLength;
      case 'object':
        // @ts-ignore
        return Object.entries(val).length <= maxLength;
      case 'undefined':
      case 'null':
        return true;
      case 'number':
        // @ts-ignore
        return val.toString().length <= maxLength;
      default:
        throw new Error(
          `typeofValue returned ${typeofValue(
            val
          )} type which we don't know how to check if it's longer than the max limit or not`
        );
    }
  };
};
