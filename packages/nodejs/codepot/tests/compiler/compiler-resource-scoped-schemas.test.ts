import { describe, expect, it } from 'vitest';

import { compile } from '@/compiler';
import type { HttpMethod, RouteMethodDefinition, RoutesDefinition } from '@/contract/types/ir/resource/route/definition';
import { v1 } from '../fixtures/contracts/demo.contract';

function expectRouteMethod(routes: RoutesDefinition, path: string, method: HttpMethod): RouteMethodDefinition {
  const pathRoute = routes[path];
  expect(pathRoute).toBeDefined();

  const routeMethod = pathRoute?.[method];
  expect(routeMethod).toBeDefined();

  return routeMethod as RouteMethodDefinition;
}

describe('compiler resource-scoped schemas', () => {
  it('promotes resource params to root schemas.params with dotted keys', () => {
    const ir = compile(v1.snapshot());

    expect(ir.schemas.params['resource.users.id']).toMatchObject({
      ownership: {
        $ref: '#/resources/users',
      },
      ref: {
        $ref: '#/schemas/entities/base_entity/fields/id',
      },
    });
    expect(ir.schemas.params['users.id']).toBeUndefined();
    expect(ir.schemas.params.users_id).toBeUndefined();

    expect(ir.schemas.params['resource.posts.id']).toMatchObject({
      ownership: {
        $ref: '#/resources/posts',
      },
    });
    expect(ir.schemas.params['posts.id']).toBeUndefined();
    expect(ir.schemas.params.posts_id).toBeUndefined();
  });

  it('routes reference promoted resource params when params are resource-local', () => {
    const ir = compile(v1.snapshot());
    const route = expectRouteMethod(ir.resources.users.routes, '/:id', 'get');

    expect(route.params).toEqual({
      $ref: '#/schemas/params/resource.users.id',
    });
  });

  it('keeps routes that use global params on global refs', () => {
    const ir = compile(v1.snapshot());
    const route = expectRouteMethod(ir.resources.tenants.routes, '/:tenantId', 'get');

    expect(route.params).toEqual({
      $ref: '#/schemas/params/tenant_id',
    });
  });

  it('does not scope shared global DTOs', () => {
    const ir = compile(v1.snapshot());

    expect(ir.schemas.dtos.api_response).toBeDefined();
    expect(ir.schemas.dtos['resource.users.api_response']).toBeUndefined();
  });
});
