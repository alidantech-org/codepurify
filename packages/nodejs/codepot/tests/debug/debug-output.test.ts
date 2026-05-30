import { describe, expect, it } from 'vitest';

import { emitDebugPackage, writeDebugPackageJson, writeDebugPackageYaml } from '@/index';

import { demoConfig } from '@/tests/fixtures/contracts/demo.contract';

describe('debug authoring output', () => {
  it('emits collected authoring intent', () => {
    const output = emitDebugPackage(demoConfig);

    expect(output.contracts).toHaveLength(1);

    const json = JSON.stringify(output);

    expect(json).toContain('"key":"demo_api"');
    expect(json).toContain('"version":1');

    expect(json).toContain('property:primitive:id');
    expect(json).toContain('property:primitive:displayName');
    expect(json).toContain('property:primitive:email');
    expect(json).toContain('property:enum:UserRole');

    expect(json).toContain('schema:entity:User:field:name');
    expect(json).toContain('schema:entity:User:field:role');
    expect(json).toContain('schema:model:User:read');
    expect(json).toContain('schema:dto:ErrorResponse');

    expect(json).toContain('security:scheme:bearer');
    expect(json).toContain('security:auth:jwt');
    expect(json).toContain('security:role_source:userRole');
    expect(json).toContain('security:role_set:admins');

    expect(json).toContain('"contentTypes"');
    expect(json).toContain('"json"');
    expect(json).toContain('"application/json"');
    expect(json).toContain('transport:response:BadRequest');
    expect(json).toContain('transport:response:Unauthorized');
    expect(json).toContain('transport:response:NotFound');

    expect(json).toContain('resource:users:operation:listUsers');
    expect(json).toContain('resource:users:operation:getUser');
    expect(json).toContain('resource:users:operation:publicProfile');

    expect(json).toContain('"listUsers"');
    expect(json).toContain('"getUser"');
    expect(json).toContain('"publicProfile"');

    expect(json).toContain('"path":"/"');
    expect(json).toContain('"path":"/:id"');
    expect(json).toContain('"path":"/public/:id"');

    expect(json).toContain('"routes"');
    expect(json).toContain('"responses"');
    expect(json).toContain('schema:model:User:read');

    expect(json).not.toContain('"$ref"');
    expect(json).not.toContain('#/schemas');
    expect(json).not.toContain('#/transport');
    expect(json).not.toContain('#/security');

    // Verify operations do not contain duplicated input/output
    const contract = output.contracts[0] as any;
    expect(contract.resources.users.operations.listUsers.input).toBeUndefined();
    expect(contract.resources.users.operations.listUsers.output).toBeUndefined();
  });

  it('writes debug json string without compiled refs', () => {
    const json = writeDebugPackageJson(demoConfig);

    expect(json).toContain('"contracts"');
    expect(json).toContain('security:auth:jwt');
    expect(json).not.toContain('"$ref"');
    expect(json).not.toContain('#/schemas');
  });

  it('writes debug yaml string without compiled refs', () => {
    const yaml = writeDebugPackageYaml(demoConfig);

    expect(yaml).toContain('contracts:');
    expect(yaml).toContain('security:auth:jwt');
    expect(yaml).not.toContain('$ref');
    expect(yaml).not.toContain('#/schemas');
  });
});
