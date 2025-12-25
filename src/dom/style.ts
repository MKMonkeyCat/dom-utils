/**
 * Injects a <style> tag with the provided CSS into the document.
 * @param css - The CSS text to inject.
 * @param options - Optional configuration such as `id`, `nonce`, and target container.
 * @returns An object containing the created style element and a `remove` function.
 */
export const injectStyle = (
  css: string,
  options: { id?: string; nonce?: string; target?: HTMLElement } = {},
): { style: HTMLStyleElement; remove: () => void } => {
  const { id, nonce, target = document.head } = options;
  const style = document.createElement('style');
  if (id) style.id = id;
  if (nonce) style.setAttribute('nonce', nonce);
  style.textContent = css;
  target.appendChild(style);

  const remove = () => {
    style.parentNode?.removeChild(style);
  };

  return { style, remove };
};
