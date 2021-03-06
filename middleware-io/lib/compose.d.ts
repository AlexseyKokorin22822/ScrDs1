import { Middleware } from './types';
/**
 * Compose an array of middleware handlers into a single handler
 *
 * @param middlewares - The array of middleware
 *
 * @returns Composed middleware
 */
export declare function compose<T>(middlewares: Middleware<T>[]): Middleware<T>;
