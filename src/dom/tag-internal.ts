import { isMarkedAs, markFunc, type TaggedFunction } from '../utils/tag';

/**
 * Marks a function as an mk utils internal event handler.
 * @param func - The function to mark.
 * @returns The marked function.
 */
export const markAsEventFunc = <F extends CallableFunction>(
  func: F,
): TaggedFunction<F, '__mkEvent'> => markFunc(func, '__mkEvent');

/**
 * Checks if a function is marked as an mk utils internal event handler.
 * @param func - The function to check.
 * @returns True if the function is marked as an event handler, false otherwise.
 */
export const isEventFunc = <F extends CallableFunction>(
  func: F,
): func is TaggedFunction<F, '__mkEvent'> => isMarkedAs(func, '__mkEvent');
