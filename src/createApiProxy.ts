//
//

export type RemoveFirstArg<T> = T extends (
  context: any,
  ...args: infer Rest
) => infer R
  ? (...args: Rest) => R extends Promise<any> ? R : Promise<R>
  : T;

//
//

export type RemoveFirstArgFromObject<T> = {
  [K in keyof T]: T[K] extends Function
    ? RemoveFirstArg<T[K]>
    : T[K] extends object
      ? RemoveFirstArgFromObject<T[K]>
      : never;
};

//
//

export function createApiProxy<T>(
  callback: (path: string, args: any[]) => any,
  path = '',
): RemoveFirstArgFromObject<T> {
  return new Proxy(() => {}, {
    get(_, prop: string) {
      return createApiProxy(callback, path ? `${path}.${prop}` : prop);
    },
    apply(_, __, args) {
      return callback(path, args);
    },
  }) as any;
}
