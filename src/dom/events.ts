import type { SingleOrArray } from '../utils/types';
import { markAsEventFunc } from './tag-internal';

/**
 * Options for onClickOutside function.
 */
export interface OnClickOutsideOptions {
  /** Event type to listen for. Default: 'mousedown' */
  event?: 'mousedown' | 'mouseup' | 'click';
  /** Whether to capture the event. Default: true */
  capture?: boolean;
  /** Elements to exclude from the outside check */
  exclude?: (HTMLElement | null)[];
}

/**
 * Attaches a listener that triggers when clicking outside the specified element.
 * @param element - The element to watch.
 * @param callback - The callback to invoke when clicking outside.
 * @param options - Configuration options.
 * @returns A function to remove the listener.
 */
export const onClickOutside = (
  element: HTMLElement,
  callback: (event: MouseEvent) => void,
  options: OnClickOutsideOptions = {},
): (() => void) => {
  const { event = 'mousedown', capture = true, exclude = [] } = options;

  const handleClick = (e: MouseEvent) => {
    const target = e.target as Node;

    // Check if click is on the element or its descendants
    if (element.contains(target)) return;

    // Check if click is on excluded elements
    if (exclude.some((el) => el?.contains(target))) return;

    callback(e);
  };

  document.addEventListener(event, handleClick, capture);

  return () => document.removeEventListener(event, handleClick, capture);
};

/**
 * Options for onKeyPress function.
 */
export interface OnKeyPressOptions {
  /** Whether to prevent default behavior. Default: false */
  preventDefault?: boolean;
  /** Whether to stop propagation. Default: false */
  stopPropagation?: boolean;
  /** Event type. Default: 'keydown' */
  event?: 'keydown' | 'keyup' | 'keypress';
  /** Target element. Default: document */
  target?: HTMLElement | Document;
}

/**
 * Attaches a listener for specific key presses.
 * @param key - The key or keys to listen for (e.g., 'Escape', 'Enter', ['a', 'b']).
 * @param callback - The callback to invoke when the key is pressed.
 * @param options - Configuration options.
 * @returns A function to remove the listener.
 */
export const onKeyPress = (
  key: string | string[],
  callback: (event: KeyboardEvent) => void,
  options: OnKeyPressOptions = {},
): (() => void) => {
  const {
    preventDefault = false,
    stopPropagation = false,
    event = 'keydown',
    target = document,
  } = options;

  const keys = Array.isArray(key) ? key : [key];

  const handleKeyPress = (e: KeyboardEvent) => {
    if (keys.includes(e.key)) {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
      callback(e);
    }
  };

  target.addEventListener(event, handleKeyPress as EventListener);

  return () => target.removeEventListener(event, handleKeyPress as EventListener);
};

/**
 * Options for onEscape function.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OnEscapeOptions extends Omit<OnKeyPressOptions, 'event'> {}

/**
 * Attaches a listener for the Escape key.
 * @param callback - The callback to invoke when Escape is pressed.
 * @param options - Configuration options.
 * @returns A function to remove the listener.
 */
export const onEscape = (
  callback: (event: KeyboardEvent) => void,
  options: OnEscapeOptions = {},
): (() => void) => {
  return onKeyPress('Escape', callback, options);
};

/**
 * Options for onEnter function.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OnEnterOptions extends Omit<OnKeyPressOptions, 'event'> {}

/**
 * Attaches a listener for the Enter key.
 * @param callback - The callback to invoke when Enter is pressed.
 * @param options - Configuration options.
 * @returns A function to remove the listener.
 */
export const onEnter = (
  callback: (event: KeyboardEvent) => void,
  options: OnEnterOptions = {},
): (() => void) => {
  return onKeyPress('Enter', callback, options);
};

/**
 * Options for onLongPress function.
 */
export interface OnLongPressOptions {
  /** Duration in milliseconds to trigger long press. Default: 500 */
  duration?: number;
  /** Threshold in pixels for movement tolerance. Default: 10 */
  threshold?: number;
}

/**
 * Attaches a listener for long press events.
 * @param element - The element to watch.
 * @param callback - The callback to invoke on long press.
 * @param options - Configuration options.
 * @returns A function to remove the listeners.
 */
export const onLongPress = (
  element: HTMLElement,
  callback: (event: MouseEvent | TouchEvent) => void,
  options: OnLongPressOptions = {},
): (() => void) => {
  const { duration = 500, threshold = 10 } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;

  const getPoint = (e: MouseEvent | TouchEvent) => ('touches' in e ? e.touches[0] : e);

  const handleStart = markAsEventFunc((e: MouseEvent | TouchEvent) => {
    const point = getPoint(e);
    startX = point.clientX;
    startY = point.clientY;

    timeoutId = setTimeout(() => {
      callback(e);
    }, duration);
  });

  const handleMove = markAsEventFunc((e: MouseEvent | TouchEvent) => {
    if (!timeoutId) return;

    const point = getPoint(e);
    const deltaX = Math.abs(point.clientX - startX);
    const deltaY = Math.abs(point.clientY - startY);

    if (deltaX > threshold || deltaY > threshold) {
      handleEnd();
    }
  });

  const handleEnd = markAsEventFunc(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  });

  const removeListeners = addEventsListener(element, {
    mousedown: handleStart as EventListener,
    mousemove: handleMove as EventListener,
    mouseup: handleEnd,
    mouseleave: handleEnd,
    touchstart: handleStart as EventListener,
    touchmove: handleMove as EventListener,
    touchend: handleEnd,
    touchcancel: handleEnd,
  });

  return () => {
    removeListeners();
    if (timeoutId) clearTimeout(timeoutId);
  };
};

/**
 * Attaches a one-time event listener.
 * @param element - The element to attach the listener to.
 * @param event - The event type.
 * @param callback - The callback to invoke.
 * @param options - Event listener options.
 * @returns A function to remove the listener.
 */
export const onceEvent = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  callback: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions,
): (() => void) => {
  const handler = (e: HTMLElementEventMap[K]) => {
    callback(e);
    element.removeEventListener(event, handler, options);
  };

  element.addEventListener(event, handler, options);

  return () => element.removeEventListener(event, handler, options);
};

/**
 * Attaches multiple event listeners to an element.
 * @param element - The element to attach listeners to.
 * @param events - An object mapping event types to handlers.
 */
export const addEventsListener = <E extends HTMLElement>(
  element: E,
  events: Partial<{
    [K in Parameters<E['addEventListener']>[0]]: SingleOrArray<
      Parameters<E['addEventListener']>[1]
    >;
  }>,
  options?: AddEventListenerOptions,
): (() => void) => {
  const handlers: [eventName: string, eventHandlers: EventListener][] = [];

  Object.entries(events).forEach(([eventKey, handler]) => {
    if (!handler) return;
    const event = eventKey;

    if (Array.isArray(handler)) {
      handler.forEach((h: EventListener) => {
        element.addEventListener(event, h, options);
        handlers.push([event, h]);
      });
    } else {
      element.addEventListener(event, handler as EventListener, options);
      handlers.push([event, handler as EventListener]);
    }
  });

  return () => {
    handlers.forEach(([event, handler]) => {
      element.removeEventListener(event, handler, options);
    });
  };
};
