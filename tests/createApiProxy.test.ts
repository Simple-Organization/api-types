import { expect, test } from '@playwright/test';
import { createApiProxy } from '../src';

//
//

type Context = {
  user?: {
    id: string;
    name: string;
  };
};

//
//

test.describe('createApiProxy.test', () => {
  //
  //

  const apiRoutes = {
    custumer: {
      get: (ctx: Context) => 1,
      update: (ctx: Context) => {},
    },
  };

  //
  //

  test('Must work 1', async () => {
    let received = null;

    const api = createApiProxy<typeof apiRoutes>((path, args) => {
      received = { path, args };

      if (path === 'custumer.get') {
        return Promise.resolve(1);
      }
    });

    const number = api.custumer.get();

    expect(number).toBeInstanceOf(Promise);

    // @ts-ignore
    const awaited = await number;

    expect(awaited).toBe(1);

    expect(received).toEqual({ path: 'custumer.get', args: [] });
  });

  //
  //

  test('Must work 2 with signal pattern', async () => {
    let received = null;

    function apiWithSignal(number: number) {
      return createApiProxy<typeof apiRoutes>((path, args) => {
        received = { path, args };

        if (path === 'custumer.get') {
          return Promise.resolve(1 + number);
        }
      });
    }

    const number = apiWithSignal(3).custumer.get();

    expect(number).toBeInstanceOf(Promise);

    // @ts-ignore
    const awaited = await number;

    expect(awaited).toBe(4);

    expect(received).toEqual({ path: 'custumer.get', args: [] });
  });
});
