import { Middleware, NextMiddleware, LazyMiddlewareFactory, BranchMiddlewareCondition, CaughtMiddlewareHandler } from './types';
/**
 * Call `next()` in middleware
 */
export declare const skipMiddleware: <T>(context: T, next: NextMiddleware) => Promise<unknown>;
/**
 * Does not call `next()` in middleware
 */
export declare const stopMiddleware: <T>(context: T, next: NextMiddleware) => Promise<void>;
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
export declare const getLazyMiddleware: <T>(factory: LazyMiddlewareFactory<T>) => Middleware<T>;
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
export declare const getTapMiddleware: <T>(middleware: Middleware<T>) => Middleware<T>;
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
export declare const getForkMiddleware: <T>(middleware: Middleware<T>) => Middleware<T>;
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
export declare const getBranchMiddleware: <T>(condition: BranchMiddlewareCondition<T>, trueMiddleware: Middleware<T>, falseMiddleware: Middleware<T>) => Middleware<T>;
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
export declare const getOptionalMiddleware: <T>(condition: BranchMiddlewareCondition<T>, optionalMiddleware: Middleware<T>) => Middleware<T>;
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
export declare const getFilterMiddleware: <T>(condition: BranchMiddlewareCondition<T>, filterMiddleware: Middleware<T>) => Middleware<T>;
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
export declare const getBeforeMiddleware: <T>(beforeMiddleware: Middleware<T>, middleware: Middleware<T>) => Middleware<T>;
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
export declare const getAfterMiddleware: <T>(middleware: Middleware<T>, afterMiddleware: Middleware<T>) => Middleware<T>;
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
export declare const getEnforceMiddleware: <T>(beforeMiddleware: Middleware<T>, middleware: Middleware<T>, afterMiddleware: Middleware<T>) => Middleware<T>;
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
export declare const getCaughtMiddleware: <T>(errorHandler: CaughtMiddlewareHandler<T>) => Middleware<T>;
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
export declare const getConcurrencyMiddleware: <T>(middlewares: Middleware<T>[]) => Middleware<T>;
