import { NextMiddleware, Middleware } from './types';
export declare function assertMiddleware<T extends unknown>(middleware: unknown): asserts middleware is Middleware<T>;
export declare function assertMiddlewares<T extends unknown>(middlewares: unknown[]): asserts middlewares is Middleware<T>[];
export declare const wrapMiddlewareNextCall: <T>(context: T, middleware: Middleware<T>) => Promise<boolean>;
/**
 * Noop for call `next()` in middleware
 */
export declare const noopNext: NextMiddleware;
