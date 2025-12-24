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
      setClassName(element, value);
      return;
    }

    if (key === 'style') {
      setStyle(element, value);
      return;
    }

    if (key === 'dataset' && typeof value === 'object') {
      Object.assign(element.dataset, value as Record<string, string>);
      return;
    }

    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase();
      attachEventListener(element, eventName, value);
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

const setClassName = (element: HTMLElement, value: unknown) => {
  const classes = Array.isArray(value) ? parseClass(...value) : parseClass(value as string);
  element.className = classes.join(' ');
};

const setStyle = (element: HTMLElement, value: unknown) => {
  if (typeof value === 'string') {
    element.style.cssText = value;
  } else if (typeof value === 'object') {
    Object.assign(element.style, value);
  }
};

const attachEventListener = (element: HTMLElement, eventName: string, value: unknown) => {
  if (typeof value === 'function') {
    element.addEventListener(eventName, value as EventListener);
  } else if (Array.isArray(value)) {
    value.forEach((handler) => {
      if (typeof handler === 'function') {
        element.addEventListener(eventName, handler);
      }
    });
  }
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
