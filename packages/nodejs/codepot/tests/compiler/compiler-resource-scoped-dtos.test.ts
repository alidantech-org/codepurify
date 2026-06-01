import { describe, expect, it } from 'vitest';

import { compile } from '@/compiler';
import { v1 } from '../fixtures/contracts/demo.contract';

// ============================================================================
// TESTS
// ============================================================================

describe('compiler resource-scoped DTOs', () => {
  it('keeps shared DTOs global', () => {
    const ir = compile(v1.snapshot());

    expect(ir.schemas.dtos.api_response).toBeDefined();
    expect(ir.schemas.dtos.paginated_response).toBeDefined();
    expect(ir.schemas.dtos.error_response).toBeDefined();

    expect(ir.schemas.dtos['users.api_response']).toBeUndefined();
    expect(ir.schemas.dtos['users.paginated_response']).toBeUndefined();
    expect(ir.schemas.dtos['users.error_response']).toBeUndefined();
  });

  it('uses scoped DTO refs in user routes when DTOs are resource-local', () => {
    const ir = compile(v1.snapshot());
    const users = ir.resources.users;
    const routeJson = JSON.stringify(users.routes);

    if (ir.schemas.dtos['users.user_response'] !== undefined) {
      expect(routeJson).toContain('#/schemas/dtos/users.user_response');
    }

    if (ir.schemas.dtos['users.user_list_response'] !== undefined) {
      expect(routeJson).toContain('#/schemas/dtos/users.user_list_response');
    }

    if (ir.schemas.dtos['users.create_user_body'] !== undefined) {
      expect(routeJson).toContain('#/schemas/dtos/users.create_user_body');
    }
  });

  it('does not emit underscore-scoped user DTO keys', () => {
    const ir = compile(v1.snapshot());

    expect(ir.schemas.dtos.users_user_response).toBeUndefined();
    expect(ir.schemas.dtos.users_user_list_response).toBeUndefined();
    expect(ir.schemas.dtos.users_create_user_body).toBeUndefined();
  });
});
