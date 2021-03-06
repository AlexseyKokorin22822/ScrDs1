'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function assertMiddleware(middleware) {
    if (typeof middleware !== 'function') {
        throw new TypeError('Middleware must be composed of function!');
    }
}
function assertMiddlewares(middlewares) {
    middlewares.forEach(assertMiddleware);
}
const wrapMiddlewareNextCall = async (context, middleware) => {
    let called = false;
    await middleware(context, async () => {
        if (called) {
            throw new Error('next() called multiple times');
        }
        called = true;
    });
    return called;
};
/**
 * Noop for call `next()` in middleware
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopNext = () => Promise.resolve();

/**
 * Compose an array of middleware handlers into a single handler
 *
 * @param middlewares - The array of middleware
 *
 * @returns Composed middleware
 */
function compose(middlewares) {
    assertMiddlewares(middlewares);
    if (middlewares.length === 0) {
        return (context, next) => Promise.resolve(next());
    }
    if (middlewares.length === 1) {
        const [middleware] = middlewares;
        return (context, next) => (Promise.resolve(middleware(context, next)));
    }
    return (context, next) => {
        let lastIndex = -1;
        const nextDispatch = (index) => {
            if (index <= lastIndex) {
                return Promise.reject(new Error('next() called multiple times'));
            }
            lastIndex = index;
            const middleware = middlewares[index];
            if (!middleware) {
                return next();
            }
            try {
                return Promise.resolve(middleware(context, () => (nextDispatch(index + 1))));
            }
            catch (error) {
                return Promise.reject(error);
            }
        };
        return nextDispatch(0);
    };
}

/**
 * Call `next()` in middleware
 */
const skipMiddleware = (context, next) => next();
/**
 * Does not call `next()` in middleware
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stopMiddleware = (context, next) => (Promise.resolve());
/**
 * Lazily asynchronously gets middleware
 *
 * Example:
 *
 * ```ts
 * getLazyMiddleware(async (context) => {
 *   const route = await getSomeRoute(context.path) // Promise<Function>;
 *
 *   return route;
 * });
 * ```
 */
const getLazyMiddleware = (factory) => {
    let middleware;
    return async (context, next) => {
        if (middleware === undefined) {
            middleware = await factory(context);
        }
        return middleware(context, next);
    };
};
/**
 * Runs the middleware and force call `next()`
 *
 * Example:
 *
 * ```ts
 * getTapMiddleware((context) => {
 *   console.log('Context', context);
 * });
 * ```
 */
const getTapMiddleware = (middleware) => (async (context, next) => {
    await middleware(context, noopNext);
    return next();
});
/**
 * Runs the middleware at the next event loop and force call `next()`
 *
 * Example:
 *
 * ```ts
 * getForkMiddleware((context) => {
 *   statisticsMiddlewares(context).catch(console.error);
 * });
 * ```
 */
const getForkMiddleware = (middleware) => ((context, next) => {
    setImmediate(middleware, context, noopNext);
    return next();
});
/**
 * By condition splits the middleware
 *
 * Example:
 *
 * ```ts
 * getBranchMiddleware(
 *   async context => context.is('Content-Type', 'json'),
 *   myBodyParser.json(),
 *   myBodyParser.urlencoded()
 * );
 * ```
 *
 * Static condition
 *
 * ```ts
 * getBranchMiddleware(
 *   process.env.NODE_ENV === 'production',
 *   logger.loggedContextToFile(),
 *   logger.loggedContextToConsole()
 * );
 * ```
 */
const getBranchMiddleware = (condition, trueMiddleware, falseMiddleware) => {
    if (typeof condition !== 'function') {
        return condition
            ? trueMiddleware
            : falseMiddleware;
    }
    return async (context, next) => (await condition(context)
        ? trueMiddleware(context, next)
        : falseMiddleware(context, next));
};
/**
 * Conditionally runs optional middleware or skips middleware
 *
 * Example:
 *
 * ```ts
 * getOptionalMiddleware(
 *   context => context.user.isAdmin,
 *   addFieldsForAdmin
 * );
 * ```
 */
const getOptionalMiddleware = (condition, optionalMiddleware) => (getBranchMiddleware(condition, optionalMiddleware, skipMiddleware));
/**
 * Conditionally runs middleware or stops the chain
 *
 * Example:
 *
 * ```ts
 * getFilterMiddleware(
 *   context => context.authorized,
 *   middlewareForAuthorized
 * );
 * ```
 */
const getFilterMiddleware = (condition, filterMiddleware) => (getBranchMiddleware(condition, filterMiddleware, stopMiddleware));
/**
 * Runs the second middleware before the main
 *
 * Example:
 *
 * ```ts
 * getBeforeMiddleware(
 *   myMockMiddleware,
 *   ouputUserData
 * );
 * ```
 */
const getBeforeMiddleware = (beforeMiddleware, middleware) => (
// eslint-disable-next-line consistent-return
async (context, next) => {
    const called = await wrapMiddlewareNextCall(context, beforeMiddleware);
    if (called) {
        return middleware(context, next);
    }
});
/**
 * Runs the second middleware after the main
 *
 * Example:
 *
 * ```ts
 * getAfterMiddleware(
 *   sendSecureData,
 *   clearSecurityData
 * );
 * ```
 */
const getAfterMiddleware = (middleware, afterMiddleware) => (
// eslint-disable-next-line consistent-return
async (context, next) => {
    const called = await wrapMiddlewareNextCall(context, middleware);
    if (called) {
        return afterMiddleware(context, next);
    }
});
/**
 * Runs middleware before and after the main
 *
 * Example:
 *
 * ```ts
 * getEnforceMiddleware(
 *   prepareData,
 *   sendData,
 *   clearData
 * );
 */
const getEnforceMiddleware = (beforeMiddleware, middleware, afterMiddleware) => (async (context, next) => {
    const beforeCalled = await wrapMiddlewareNextCall(context, beforeMiddleware);
    if (!beforeCalled) {
        return;
    }
    const middlewareCalled = await wrapMiddlewareNextCall(context, middleware);
    if (!middlewareCalled) {
        return;
    }
    // eslint-disable-next-line consistent-return
    return afterMiddleware(context, next);
});
/**
 * Catches errors in the middleware chain
 *
 * Example:
 * ```js
 * getCaughtMiddleware((context, error) => {
 *   if (error instanceof NetworkError) {
 *     return context.send('Sorry, network issues 😔');
 *   }
 *
 *   throw error;
 * })
 * ```
 *
 * Without a snippet, it would look like this:
 *
 * ```js
 * async (context, next) => {
 *   try {
 *     await next();
 *   } catch (error) {
 *     if (error instanceof NetworkError) {
 *       return context.send('Sorry, network issues 😔');
 *     }
 *
 *     throw error;
 *   }
 * };
 * ```
 */
const getCaughtMiddleware = (errorHandler) => (
// eslint-disable-next-line consistent-return
async (context, next) => {
    try {
        await next();
    }
    catch (error) {
        return errorHandler(context, error);
    }
});
/**
 * Concurrently launches middleware,
 * the chain will continue if `next()` is called in all middlewares
 *
 * **Warning: Error interrupts all others**
 *
 * Example:
 *
 * ```ts
 * getConcurrencyMiddleware(
 *   initializeUser,
 *   initializeSession,
 *   initializeDatabase
 * );
 * ```
 */
const getConcurrencyMiddleware = (middlewares) => (
// eslint-disable-next-line consistent-return
async (context, next) => {
    const concurrencies = await Promise.all(middlewares.map((middleware) => (wrapMiddlewareNextCall(context, middleware))));
    if (concurrencies.every(Boolean)) {
        return next();
    }
});

/**
 * A simple middleware compose builder
 */
class Composer {
    constructor() {
        this.middlewares = [];
    }
    /**
     * Invokes a new instance of the Composer class
     */
    static builder() {
        return new Composer();
    }
    /**
     * The number of middleware installed in Composer
     */
    get length() {
        return this.middlewares.length;
    }
    /**
     * Clones a composer object
     */
    clone() {
        const composer = new Composer();
        composer.middlewares = [...this.middlewares];
        return composer;
    }
    /**
     * Adds middleware to the chain
     */
    use(middleware) {
        assertMiddleware(middleware);
        this.middlewares.push(middleware);
        return this;
    }
    /**
     * Lazily asynchronously gets middleware
     */
    lazy(factory) {
        return this.use(getLazyMiddleware(factory));
    }
    /**
     * Runs the middleware and force call `next()`
     */
    tap(middleware) {
        return this.use(getTapMiddleware(middleware));
    }
    /**
     * Runs the middleware at the next event loop and force call `next()`
     */
    fork(middleware) {
        return this.use(getForkMiddleware(middleware));
    }
    /**
     * By condition splits the middleware
     */
    branch(condition, trueMiddleware, falseMiddleware) {
        return this.use(getBranchMiddleware(condition, trueMiddleware, falseMiddleware));
    }
    /**
     * Conditionally runs optional middleware or skips middleware
     */
    optional(condition, optionalMiddleware) {
        return this.use(getOptionalMiddleware(condition, optionalMiddleware));
    }
    /**
     * Conditionally runs middleware or stops the chain
     */
    filter(condition, filterMiddleware) {
        return this.use(getFilterMiddleware(condition, filterMiddleware));
    }
    /**
     * Runs the second middleware before the main
     */
    before(beforeMiddleware, middleware) {
        return this.use(getBeforeMiddleware(middleware, beforeMiddleware));
    }
    /**
     * Runs the second middleware after the main
     */
    after(middleware, afterMiddleware) {
        return this.use(getAfterMiddleware(middleware, afterMiddleware));
    }
    /**
     * Runs middleware before and after the main
     */
    enforce(beforeMiddleware, middleware, afterMiddleware) {
        return this.use(getEnforceMiddleware(middleware, beforeMiddleware, afterMiddleware));
    }
    /**
     * Catches errors in the middleware chain
     */
    caught(errorHandler) {
        return this.use(getCaughtMiddleware(errorHandler));
    }
    /**
     * Concurrently launches middleware,
     * the chain will continue if `next()` is called in all middlewares
     */
    concurrency(middlewares) {
        return this.use(getConcurrencyMiddleware(middlewares));
    }
    /**
     * Compose middleware handlers into a single handler
     */
    compose() {
        return compose([...this.middlewares]);
    }
}

exports.Composer = Composer;
exports.compose = compose;
exports.default = compose;
exports.getAfterMiddleware = getAfterMiddleware;
exports.getBeforeMiddleware = getBeforeMiddleware;
exports.getBranchMiddleware = getBranchMiddleware;
exports.getCaughtMiddleware = getCaughtMiddleware;
exports.getConcurrencyMiddleware = getConcurrencyMiddleware;
exports.getEnforceMiddleware = getEnforceMiddleware;
exports.getFilterMiddleware = getFilterMiddleware;
exports.getForkMiddleware = getForkMiddleware;
exports.getLazyMiddleware = getLazyMiddleware;
exports.getOptionalMiddleware = getOptionalMiddleware;
exports.getTapMiddleware = getTapMiddleware;
exports.noopNext = noopNext;
exports.skipMiddleware = skipMiddleware;
exports.stopMiddleware = stopMiddleware;
