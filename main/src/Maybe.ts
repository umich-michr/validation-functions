//functors: you apply a function to a wrapped value using fmap or <$>
//applicatives: you apply a wrapped function to a wrapped value using <*> or liftA
//monads: you apply a function that returns a wrapped value, to a wrapped value using >>= or liftM
import {Applicative, Functor, Monad} from "./functional-interfaces";

export class Maybe<T> implements Monad<T>{
    private readonly value: T;
    private readonly isNothing: boolean;
    constructor(val: T) {
        this.value = val;
        this.isNothing = !val || (Array.isArray(val) && !(val as Array<any>).length) || typeof val !== 'function' && !Object.keys(val as Object).length;
        // console.log(this.value);
    }
    private join() {
        return this.value;
    }
    inspect() {
        if (!this.isNothing) {
            return `Maybe(${JSON.stringify(this.join())})`;
        }else if(typeof this.value==='function'){
            return `Maybe(${this.value.toString()})`;
        }
        return "Nothing";
    }
    /**
     * Functors apply a function to a wrapped value
     * map :: Monad m => (a -> b) -> m a -> m b
     */
    map(f: (val:T)=>any): Maybe<any> {
        if (this.isNothing) {
            return this;
        }
        return Maybe.of(f(this.value));
    }
    /**
     * Monads apply a function that returns a wrapped value to a wrapped value. Monads have a function >>= (pronounced "bind") to do this.
     * A combinator, typically called bind (as in binding a variable) and represented with an infix operator >>= or a method called flatMap, that unwraps a monadic variable, then inserts it into a monadic function/expression, resulting in a new monadic value
     * (>>=) : (M T, T → M U) → M U[g] so if mx : M T and f : T → M U, then (mx >>= f) : M U
     * bind/flatMap/chain :: Monad m => (a -> mb ) -> m a -> m b
     */
    bind(f: (val: T) => Monad<any>): Monad<any> {
        if (this.isNothing) {
            return this;
        }
        return this.map(f).join();
    }
    /**
     * Applicatives apply a wrapped function to a wrapped value
     * when this.value is a function, ap applies that function to the maybe passed as argument and returns the resulting maybe
     * ap :: Monad m => m (a -> b) -> m a -> m b
     */
    ap(otherMaybe: Monad<any>):Monad<any> {
        if(this.isNothing){
            return this;
        }
        return otherMaybe.map(this.value as (val:T)=>unknown);
    }
    /**
     * orElse :: Monad m => m a -> a -> m a
     */
    orElse(def: T) {
        if (this.isNothing) {
            return Maybe.of(def);
        }
        return this;
    }
    /**
     * If there's a wrapped value then the function will be applied to the value and the return value will be returned
     */
    onSome(f: (val:T)=>any) {
        if (!this.isNothing) {
            return f(this.value);
        }
    }
    /**
     * If there's no wrapped value then the function will be called and the return value will be returned
     */
    onNothing(f: Function) {
        if (this.isNothing) {
            return f();
        }
    }
    static of<T>(val: T) {
        return new Maybe<T>(val);
    }
    static Nothing=Symbol("Nothing");
    emit(){
        return this.value;
    }
}
