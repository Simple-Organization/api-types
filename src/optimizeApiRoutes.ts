export type OptimizedRoutes<Ctx> = Record<
  string,
  (context: Ctx, ...args: any[]) => any
>;

/**
 * Optimize a object with nested functions to a flat object to be used in a api router
 *
 * Convert a object like this
 * ```ts
 * {
 *   custumer: {
 *    get: getCustumer,
 *    update: updateCustumer,
 *   },
 * },
 * ```
 *
 * to that
 * ```ts
 * {
 *   'custumer.getCustumer': getCustumer,
 *   'custumer.updateCustumer': updateCustumer,
 * }
 * ```
 *
 * @param source The object to be optimized
 * @param parentKey The parent key of the object, example: `'api'` => `'api.custumer'`
 */
export function optimizeApiRoutes<Ctx>(
  source: any,
  parentKey = '',
): OptimizedRoutes<Ctx> {
  const result: any = {};

  for (const key in source) {
    const value = source[key];
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const nestedObject = optimizeApiRoutes(value, newKey);
      Object.assign(result, nestedObject);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
