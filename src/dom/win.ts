export const globalWin: Win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
export const globalDoc: Document = globalWin.document;

export function getWin(): Win;
export function getWin(
  target: Node | Event | ShadowRoot | Document | Window | null | undefined,
): Win | null;
export function getWin(target?: Node | Event | ShadowRoot | Document | Window | null): Win | null {
  if (!target) return globalWin;

  if (target instanceof Window) return target as Win;
  if (target instanceof UIEvent && target.view) return target.view as Win;
  if (target instanceof Document) return target.defaultView;
  if (target instanceof ShadowRoot) return target.host.ownerDocument?.defaultView ?? null;
  if (target instanceof Node) return target.ownerDocument?.defaultView ?? null;

  return null;
}

export type Win = Window & typeof globalThis;
declare const unsafeWindow: Win | undefined;
