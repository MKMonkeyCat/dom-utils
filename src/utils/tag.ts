/**
 * Type representing a function tagged with a specific string.
 */
export type TaggedFunction<F extends CallableFunction, T extends string> = F & {
  readonly [K in T]?: true;
};

/**
 * Marks a function with a specific tag.
 * @param func - The function to mark.
 * @param tag - The tag to assign.
 * @returns The marked function.
 */
export const markFunc = <F extends CallableFunction, T extends string>(
  func: F,
  tag: T,
): TaggedFunction<F, T> => {
  Object.defineProperty(func, tag, { value: true });
  return func as TaggedFunction<F, T>;
};

/**
 * Checks if a function is marked with a specific tag.
 * @param func - The function to check.
 * @param tag - The tag to look for.
 * @returns True if the function is marked with the tag, false otherwise.
 */
export const isMarkedAs = <F extends CallableFunction, T extends string>(
  func: F,
  tag: T,
): func is TaggedFunction<F, T> => !!(func as Record<string, unknown>)[tag];
