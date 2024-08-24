import { expect, test } from '@playwright/test';
import { optimizeApiRoutes } from '../src/optimizeApiRoutes';

//
//

test.describe('optimizeApiRoutes', () => {
  //
  //

  test('Must work 1', () => {
    const obj = {
      custumer: {
        get: () => {},
        update: () => {},
      },
    };

    const optimized = optimizeApiRoutes(obj);

    expect(optimized).toEqual({
      'custumer.get': obj.custumer.get,
      'custumer.update': obj.custumer.update,
    });
  });

  //
  //

  test('Must work 2', () => {
    const obj = {
      custumer: {
        get: () => {},
        update: () => {},
      },

      product: {
        get: () => {},
        update: () => {},
      },

      user: {
        get: () => {},
        update: () => {},
        loginProcess: {
          start: () => {},
          end: () => {},
        },
      },
    };

    //

    const optimized = optimizeApiRoutes(obj);

    //

    expect(optimized).toEqual({
      'custumer.get': obj.custumer.get,
      'custumer.update': obj.custumer.update,

      'product.get': obj.product.get,
      'product.update': obj.product.update,

      'user.get': obj.user.get,
      'user.update': obj.user.update,
      'user.loginProcess.start': obj.user.loginProcess.start,
      'user.loginProcess.end': obj.user.loginProcess.end,
    });
  });
});
