/**
 * Options for waitForElement function.
 */
export interface WaitForElementOptions {
  /** Maximum time to wait in milliseconds. Default: 5000 */
  timeout?: number;
  /** Root element to observe. Default: document.body */
  root?: HTMLElement;
  /** Check interval in milliseconds. Default: 100 */
  interval?: number;
}

/**
 * Waits for an element matching the selector to appear in the DOM.
 * @param selector - CSS selector to match.
 * @param options - Configuration options.
 * @returns A promise that resolves with the element when found.
 */
export const waitForElement = <T extends HTMLElement = HTMLElement>(
  selector: string,
  options: WaitForElementOptions = {},
): Promise<T> => {
  const { timeout = 5000, root = document.body, interval = 100 } = options;

  return new Promise((resolve, reject) => {
    // Check if element already exists
    const existingElement = root.querySelector<T>(selector);
    if (existingElement) {
      resolve(existingElement);
      return;
    }

    // Use MutationObserver for efficient detection
    const observer = new MutationObserver(() => {
      const element = root.querySelector<T>(selector);
      if (element) {
        cleanup();
        resolve(element);
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    // Fallback interval check
    const intervalId = setInterval(() => {
      const element = root.querySelector<T>(selector);
      if (element) {
        cleanup();
        resolve(element);
      }
    }, interval);

    // Timeout handler
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout: Element "${selector}" not found within ${timeout}ms`));
    }, timeout);

    const cleanup = () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  });
};

/**
 * Options for watchElementRemoval function.
 */
export interface WatchElementRemovalOptions {
  /** Callback to invoke when the element is removed */
  onRemove?: () => void;
  /** Root element to observe. Default: document.body */
  root?: HTMLElement;
}

/**
 * Watches for an element to be removed from the DOM.
 * @param element - The element to watch.
 * @param options - Configuration options.
 * @returns A function to stop watching.
 */
export const watchElementRemoval = (
  element: HTMLElement,
  options: WatchElementRemovalOptions = {},
): (() => void) => {
  const { onRemove, root = document.body } = options;

  const observer = new MutationObserver(() => {
    if (!root.contains(element)) {
      onRemove?.();
      observer.disconnect();
    }
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};

/**
 * Returns a promise that resolves when the element is removed from the DOM.
 * @param element - The element to watch.
 * @param options - Configuration options.
 * @returns A promise that resolves when the element is removed.
 */
export const waitForElementRemoval = (
  element: HTMLElement,
  options: { root?: HTMLElement; timeout?: number } = {},
): Promise<void> => {
  const { root = document.body, timeout } = options;

  return new Promise((resolve, reject) => {
    // Check if element is already removed
    if (!root.contains(element)) {
      resolve();
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const observer = new MutationObserver(() => {
      if (!root.contains(element)) {
        cleanup();
        resolve();
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    if (timeout) {
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout: Element not removed within ${timeout}ms`));
      }, timeout);
    }

    const cleanup = () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
};

/**
 * Options for watchElementChanges function.
 */
export interface WatchElementChangesOptions {
  /** Watch for attribute changes. Default: true */
  attributes?: boolean;
  /** Watch for child node changes. Default: true */
  childList?: boolean;
  /** Watch for text content changes. Default: false */
  characterData?: boolean;
  /** Watch subtree. Default: false */
  subtree?: boolean;
  /** Callback for mutations */
  onMutation?: (mutations: MutationRecord[]) => void;
}

/**
 * Watches for changes to an element and its descendants.
 * @param element - The element to watch.
 * @param options - Configuration options.
 * @returns A function to stop watching.
 */
export const watchElementChanges = (
  element: HTMLElement,
  options: WatchElementChangesOptions = {},
): (() => void) => {
  const {
    attributes = true,
    childList = true,
    characterData = false,
    subtree = false,
    onMutation,
  } = options;

  const observer = new MutationObserver((mutations) => onMutation?.(mutations));
  observer.observe(element, {
    attributes,
    childList,
    characterData,
    subtree,
  });

  return () => observer.disconnect();
};
