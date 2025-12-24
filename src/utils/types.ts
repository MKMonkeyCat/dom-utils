/**
 * A type that represents a value that can be either a single instance of type T or an array of type T.
 */
export type SingleOrArray<T> = T | T[];

/**
 * A type that represents a value that can be either a direct value of type T or a Promise that resolves to type T.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * A type that represents a value that can be null or undefined.
 */
export type Nullable<T> = T | null | undefined;
