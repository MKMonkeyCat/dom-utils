/**
 * Converts a camelCase string to kebab-case.
 * @param str - The camelCase string to convert.
 * @returns The kebab-case string.
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Converts a PascalCase string to kebab-case.
 * @param str - The PascalCase string to convert.
 * @returns The kebab-case string.
 */
export const pascalToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};
