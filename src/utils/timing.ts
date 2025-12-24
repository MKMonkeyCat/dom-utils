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

/**
 * Creates a promise that resolves after a specified delay.
 * @param ms - The delay in milliseconds.
 * @returns A promise that resolves after the delay.
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Pauses execution for a specified duration in async contexts.
 * @param ms - The duration to sleep in milliseconds.
 * @returns A promise that resolves after the sleep duration.
 */
export const sleep = (ms: number): Promise<void> => delay(ms);

/**
 * Creates a promise that rejects if the given promise doesn't resolve within the specified timeout.
 * @param promise - The promise to apply a timeout to.
 * @param ms - The timeout duration in milliseconds.
 * @param message - Optional error message for the timeout error.
 * @returns A promise that resolves with the original promise's value or rejects on timeout.
 */
export const timeout = <T>(
  promise: Promise<T>,
  ms: number,
  message = `Operation timed out after ${ms}ms`,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
};

/**
 * A no-operation function that does nothing when called.
 */
export const noop = (): void => {};

/**
 * Retries a function until it succeeds or reaches the maximum number of attempts.
 * @param fn - The async function to retry.
 * @param options - Configuration options for retry behavior.
 * @returns A promise that resolves with the function result or rejects if all attempts fail.
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    /** Maximum number of attempts. Default: 3 */
    maxAttempts?: number;
    /** Delay in milliseconds between attempts. Default: 1000 */
    delay?: number;
    /** Whether to use exponential backoff. Default: false */
    exponential?: boolean;
  } = {},
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000, exponential = false } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const waitTime = exponential ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Retry failed');
};
