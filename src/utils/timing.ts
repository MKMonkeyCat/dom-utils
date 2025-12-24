/**
 * Debounce function that delays the execution of a callback until after a specified wait time has elapsed.
 * @param callback - The function to debounce.
 * @param wait - The delay in milliseconds.
 * @returns A debounced function with cancel and flush methods.
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...lastArgs!);
      timeoutId = null;
      lastArgs = null;
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      callback(...lastArgs!);
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
};

/**
 * Throttle function that executes a callback at most once every specified wait time.
 * @param callback - The function to throttle.
 * @param wait - The minimum interval in milliseconds between executions.
 * @returns A throttled function with cancel and flush methods.
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    if (lastCallTime === 0) {
      callback(...args);
      lastCallTime = now;
    } else {
      const elapsed = now - lastCallTime;
      if (elapsed >= wait) {
        callback(...args);
        lastCallTime = now;
        cleanup();
      } else {
        cleanup();
        timeoutId = setTimeout(() => {
          callback(...lastArgs!);
          lastCallTime = Date.now();
          timeoutId = null;
        }, wait - elapsed);
      }
    }
  };

  throttled.cancel = () => {
    cleanup();
    lastCallTime = 0;
    lastArgs = null;
  };

  throttled.flush = () => {
    if (lastCallTime > 0 && lastArgs !== null) {
      callback(...lastArgs);
    }
    cleanup();
    lastCallTime = 0;
    lastArgs = null;
  };

  return throttled;
};
