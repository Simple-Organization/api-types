//
//

export type RemoveFirstArg<T, Ctx> = T extends (
  context: Ctx,
  ...args: infer Rest
) => infer R
  ? (...args: Rest) => R extends Promise<any> ? R : Promise<R>
  : T;

//
//

export type RemoveFirstArgFromObject<T, Ctx> = {
  [K in keyof T]: T[K] extends Function
    ? RemoveFirstArg<T[K], Ctx>
    : T[K] extends object
      ? RemoveFirstArgFromObject<T[K], Ctx>
      : never;
};

//
//

export function createApiProxy<T, Ctx>(
  callback: (path: string, args: any[]) => any,
  path = '',
): RemoveFirstArgFromObject<T, Ctx> {
  return new Proxy(() => {}, {
    get(_, prop: string) {
      return createApiProxy(callback, path ? `${path}.${prop}` : prop);
    },
    apply(_, __, args) {
      return callback(path, args);
    },
  }) as any;
}
