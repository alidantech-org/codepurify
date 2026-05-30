import { describe, expect, it } from 'vitest';

import { compilePackage, compileVersionContract } from '@/index';
import { demoConfig, demoVersion } from '../../fixtures/contracts/demo.contract';
import { expectValidCodepotDefinition } from '../../utils/assert-codepot-definition';

describe('demo contract smoke test', () => {
  it('compiles a version contract into CodepotDefinition', () => {
    const definition = compileVersionContract(demoVersion);

    expectValidCodepotDefinition(definition);

    expect(definition.key).toBe('demo_api');
    expect(definition.version).toBe(1);

    // Assert entities exist
    expect(definition.schemas.entities.User).toBeDefined();
    expect(definition.schemas.entities.User.fields).toBeDefined();
    expect(definition.schemas.entities.User.fields.id).toBeDefined();
    expect(definition.schemas.entities.User.fields.name).toBeDefined();
    expect(definition.schemas.entities.User.fields.email).toBeDefined();

    // Assert models exist
    expect(definition.schemas.models.UserRead).toBeDefined();
    expect(definition.schemas.models.UserCreate).toBeDefined();
    expect(definition.schemas.models.UserPatch).toBeDefined();
    expect(definition.schemas.models.UserQuery).toBeDefined();
    expect(definition.schemas.models.UserProjection).toBeDefined();
    expect(definition.schemas.models.UserRedacted).toBeDefined();
    expect(definition.schemas.models.UserDerived).toBeDefined();
    expect(definition.schemas.models.UserInternal).toBeDefined();

    // Assert transport responses exist
    expect(definition.transport.responses.BadRequest).toBeDefined();
    expect(definition.transport.responses.Unauthorized).toBeDefined();

    // Assert security schemes and auth exist
    expect(definition.security.schemes.bearer).toBeDefined();
    expect(definition.security.auth.jwt).toBeDefined();

    // Assert resource security ref
    expect(definition.resources.users.defaults.security?.auth).toEqual({
      $ref: '#/security/auth/jwt',
    });

    // Assert entity field refs are {$ref} objects
    expect(definition.schemas.entities.User.fields.id.type).toEqual({
      $ref: '#/properties/id',
    });

    // Assert refs are {$ref} objects, not strings
    expect(definition.schemas.dtos.ErrorResponse.fields?.message).toEqual({
      $ref: '#/schemas/entities/User/fields/name',
    });

    // Assert route response refs are {$ref} objects
    expect(definition.resources.users.routes.listUsers.methods.get?.responses[200]).toEqual({
      schema: {
        $ref: '#/schemas/models/UserRead',
        array: true,
      },
      contentType: 'application/json',
    });
  });

  it('compiles a Codepot config package', () => {
    const compiled = compilePackage(demoConfig);

    expect(compiled.contracts).toHaveLength(1);
    expectValidCodepotDefinition(compiled.contracts[0]);
  });
});
