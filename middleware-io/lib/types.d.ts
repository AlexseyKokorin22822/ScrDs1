/**
 * Returns the type of response middleware
 */
export declare type NextMiddlewareReturn = unknown;
/**
 * Call the next middleware from the chain
 */
export declare type NextMiddleware = () => Promise<NextMiddlewareReturn>;
/**
 * Returns the type of response middleware
 */
export declare type MiddlewareReturn = unknown;
/**
 * Basic middleware
 */
export declare type Middleware<T> = (context: T, next: NextMiddleware) => MiddlewareReturn;
/**
 * Asynchronous function for branch condition
 */
export declare type BranchMiddlewareConditionFunction<T> = (context: T) => Promise<boolean> | boolean;
/**
 * Possible types for branch condition
 */
export declare type BranchMiddlewareCondition<T> = BranchMiddlewareConditionFunction<T> | boolean;
/**
 * Asynchronous factory to create middleware
 */
export declare type LazyMiddlewareFactory<T> = (context: T) => Promise<Middleware<T>> | Middleware<T>;
/**
 * Handler for catching errors in middleware chains
 */
export declare type CaughtMiddlewareHandler<T> = (context: T, error: Error) => MiddlewareReturn;
