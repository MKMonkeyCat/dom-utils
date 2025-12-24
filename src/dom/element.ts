/**
 * Parses class names from various input formats into a flat array of class names.
 * @param classNames - Class names as strings, arrays of strings, or undefined.
 * @returns An array of individual class names.
 */
export const parseClass = (...classNames: (string | string[] | undefined)[]): string[] => {
  return classNames.flatMap((className) => {
    if (typeof className === 'string') {
      return className.trim().split(/\s+/).filter(Boolean);
    }
    return className || [];
  });
};

/**
 * Creates an HTML element with specified attributes and children.
 * @param tag - The tag name of the HTML element to create.
 * @param attributes - An object containing attributes, styles, event handlers, and dataset entries to set on the element.
 * @param children - Child nodes or strings to append to the created element.
 * @returns The created HTML element.
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes?: ElementAttributes<HTMLElementTagNameMap[K]>,
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);

  if (!attributes) {
    addChildren(element, children);
    return element;
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value == null) return;

    if (key === 'className' || key === 'class') {
      const classes = Array.isArray(value) ? parseClass(...value) : parseClass(value as string);
      element.className = classes.join(' ');
      return;
    }

    if (key === 'style') {
      if (typeof value === 'string') {
        element.style.cssText = value;
      } else if (typeof value === 'object') {
        Object.assign(element.style, value);
      }
      return;
    }

    if (key === 'dataset' && typeof value === 'object') {
      Object.assign(element.dataset, value as Record<string, string>);
      return;
    }

    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase();
      if (typeof value === 'function') {
        element.addEventListener(eventName, value as EventListener);
      } else if (Array.isArray(value)) {
        value.forEach((handler) => {
          if (typeof handler === 'function') {
            element.addEventListener(eventName, handler);
          }
        });
      }
      return;
    }

    if (key in element) {
      (element as Record<string, unknown>)[key] = value;
    } else {
      element.setAttribute(key, String(value));
    }
  });

  addChildren(element, children);
  return element;
};

/**
 * Creates a DocumentFragment for batch DOM operations.
 * @param children - Child nodes or strings to add to the fragment.
 * @returns A DocumentFragment containing the children.
 */
export const createFragment = (...children: (Node | string)[]): DocumentFragment => {
  const frag = document.createDocumentFragment();
  children.forEach((child) => {
    if (typeof child === 'string') {
      frag.appendChild(document.createTextNode(child));
    } else {
      frag.appendChild(child);
    }
  });
  return frag;
};

const addChildren = (element: HTMLElement, children: (Node | string)[]) => {
  children.forEach((child) => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
};

export type CSSProperties = Partial<CSSStyleDeclaration> | string;

export type EventHandlers = {
  [K in keyof HTMLElementEventMap as `on${Capitalize<K>}`]?: (
    event: HTMLElementEventMap[K],
  ) => void;
};

export type ElementAttributes<T extends HTMLElement = HTMLElement> = {
  className?: string | string[];
  class?: string | string[];
  style?: CSSProperties;
  dataset?: Record<string, string>;
} & EventHandlers &
  Partial<Omit<T, 'style' | 'children' | 'className' | 'classList' | 'dataset'>> & {
    [key: string]: unknown;
  };

/**
 * Gets the width and height of an element (including padding and border).
 * @param element - The element to measure.
 * @returns An object with width and height properties.
 */
export const getSize = (element: HTMLElement): { width: number; height: number } => {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
};

/**
 * Gets the offset position of an element relative to the document.
 * @param element - The element to measure.
 * @returns An object with top and left properties.
 */
export const getOffset = (element: HTMLElement): { top: number; left: number } => {
  return {
    top: element.offsetTop,
    left: element.offsetLeft,
  };
};

/**
 * Gets a computed style value for an element.
 * @param element - The element to query.
 * @param property - The CSS property name.
 * @returns The computed style value.
 */
export const getComputedStyle = (element: HTMLElement, property: string): string => {
  return window.getComputedStyle(element).getPropertyValue(property).trim();
};

/**
 * Scrolls the element to a specific position (or to view if no position specified).
 * @param element - The element to scroll.
 * @param options - Scroll behavior options.
 */
export const scrollTo = (
  element: HTMLElement,
  options?: ScrollToOptions | { top?: number; left?: number },
): void => {
  if (!element) return;
  if (element === document.documentElement || element === document.body) {
    window.scrollTo(options as ScrollToOptions);
  } else {
    element.scrollTo?.(options as ScrollToOptions);
  }
};

/**
 * Scrolls the element into the viewport.
 * @param element - The element to scroll into view.
 * @param options - Scroll behavior options.
 */
export const scrollIntoView = (
  element: HTMLElement,
  options?: ScrollIntoViewOptions | boolean,
): void => {
  element.scrollIntoView?.(options);
};
