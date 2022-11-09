import test from 'tape';
import {curry} from "../../main/src/utils";

test('Multiple argument function should be curried=>Turned into single arg functions returning other single argument functions untill all args are passed',(assert)=>{
    const sum = (a: number, b: number, c: number) => a + b + c;
    let curriedSum = curry(sum);

    assert.equals( 6, curriedSum(1)(2)(3), "When all 3 args passed one by one Then return result");
    assert.equals( 6, curriedSum(1)(2, 3), "When the 1st arg passed alone And the last 2 args passed at once Then return result");
    assert.equals( 6, curriedSum(1, 2)(3), "When first 2 args passed at once And the 3rd arg passed alone Then return result" );
    assert.equals( 6, curriedSum(1, 2, 3), "When all args passed at once Then return result" );

    assert.end();
});