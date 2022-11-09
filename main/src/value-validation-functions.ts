export const ruleNames = ['required', 'email', 'maxLength'] as const;

function isEmptyString(str: string) {
    return !str.trim().length;
}

function isEmptyArray(arr: Array<string | number | Date>) {
    return !arr?.length;
}

function isEmptyObject(obj: Object) {
    return !Object.keys(obj).length;
}

const validationValueTypes = ['undefined', 'null', 'string', 'number', 'array', 'object', 'function', 'unknown'] as const;
type ValidationType = typeof validationValueTypes[number];

export function typeofValue(val: any): ValidationType {
    return (val === undefined) ? 'undefined'
        : (val === null) ? 'null'
            : (typeof val === 'string') ? 'string'
                : (typeof val === 'number') ? 'number'
                    : (Array.isArray(val)) ? 'array'
                        : (typeof val === 'function') ? 'function'
                            : (Object(val) === val) ? 'object'
                                : 'unknown';
}

export function isNotEmpty(val: null|undefined|[]|{}|''): false;
export function isNotEmpty(val: any): boolean{
    switch(typeofValue(val)){
        case 'string':
            return !isEmptyString(val);
        case 'array':
            return !isEmptyArray(val);
        case 'object':
            return !isEmptyObject(val);
        case 'undefined':
        case 'null':
            return false;
        case 'number':
        case 'function':
            return true;
        default:
            throw new Error('typeofValue returned unknown type which we dont\'t know how to check if it\'s empty or not');
    }
}

/**
 * False returned if the email address is not following the expected format
 * Regex is courtesy of: David Lott at https://www.regexlib.com/RETester.aspx?regexp_id=88 (tweaked it to pass our tests)
 * @param addr Email address in string format
 */
export function isEmail(addr: string) {
    const re = new RegExp(/^$|^([\w\-\+\.]+)@((\[([0-9]{1,3}\.){3}[0-9]{1,3}\])|(([\w\-]+\.)+)([a-zA-Z]{2,4}))$/igm);
    return re.test(addr);
}

export function isLessThan(maxLength: number) {
    return (str: string) => str.length <= maxLength;
}