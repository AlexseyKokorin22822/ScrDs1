import { Middleware, LazyMiddlewareFactory, BranchMiddlewareCondition, CaughtMiddlewareHandler } from './types';
/**
 * A simple middleware compose builder
 */
export declare class Composer<T extends object> {
    protected middlewares: Middleware<T>[];
    /**
     * Invokes a new instance of the Composer class
     */
    static builder<Context extends object>(): Composer<Context>;
    /**
     * The number of middleware installed in Composer
     */
    get length(): number;
    /**
     * Clones a composer object
     */
    clone(): Composer<T>;
    /**
     * Adds middleware to the chain
     */
    use(middleware: Middleware<T>): this;
    /**
     * Lazily asynchronously gets middleware
     */
    lazy(factory: LazyMiddlewareFactory<T>): this;
    /**
     * Runs the middleware and force call `next()`
     */
    tap(middleware: Middleware<T>): this;
    /**
     * Runs the middleware at the next event loop and force call `next()`
     */
    fork(middleware: Middleware<T>): this;
    /**
     * By condition splits the middleware
     */
    branch(condition: BranchMiddlewareCondition<T>, trueMiddleware: Middleware<T>, falseMiddleware: Middleware<T>): this;
    /**
     * Conditionally runs optional middleware or skips middleware
     */
    optional(condition: BranchMiddlewareCondition<T>, optionalMiddleware: Middleware<T>): this;
    /**
     * Conditionally runs middleware or stops the chain
     */
    filter(condition: BranchMiddlewareCondition<T>, filterMiddleware: Middleware<T>): this;
    /**
     * Runs the second middleware before the main
     */
    before(beforeMiddleware: Middleware<T>, middleware: Middleware<T>): this;
    /**
     * Runs the second middleware after the main
     */
    after(middleware: Middleware<T>, afterMiddleware: Middleware<T>): this;
    /**
     * Runs middleware before and after the main
     */
    enforce(beforeMiddleware: Middleware<T>, middleware: Middleware<T>, afterMiddleware: Middleware<T>): this;
    /**
     * Catches errors in the middleware chain
     */
    caught(errorHandler: CaughtMiddlewareHandler<T>): this;
    /**
     * Concurrently launches middleware,
     * the chain will continue if `next()` is called in all middlewares
     */
    concurrency(middlewares: Middleware<T>[]): this;
    /**
     * Compose middleware handlers into a single handler
     */
    compose(): Middleware<T>;
}
