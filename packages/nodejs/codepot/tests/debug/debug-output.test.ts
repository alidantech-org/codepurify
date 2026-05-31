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

  it('emits promotable inline properties', () => {
    const output = emitDebugPackage(demoConfig);

    expect(output.contracts).toHaveLength(1);

    const json = JSON.stringify(output);

    // Verify inline property source.mode exists
    expect(json).toContain('"mode":"inline"');

    // Verify property ref source.mode exists
    expect(json).toContain('"mode":"ref"');

    // Verify composite inline properties have promotion hints
    expect(json).toContain('"ownerKind":"composite"');

    // Verify entity inline properties have promotion hints
    expect(json).toContain('"ownerKind":"entity"');

    // Verify suggested keys are generated
    expect(json).toContain('"suggestedKey":"inline_money_amount"');
    expect(json).toContain('"suggestedKey":"user_nickname"');

    // Verify direct primitive members are no longer nested directly
    expect(json).not.toContain('"amount":{"kind":"primitive"');

    // Verify old confusing source modes no longer exist
    expect(json).not.toContain('"sourceMode"');
    expect(json).not.toContain('"kind":"property_ref"');
    expect(json).not.toContain('"kind":"inline_property"');
    expect(json).not.toContain('"kind":"property"');
  });

  it('applies meaningful defaults without verbose false noise', () => {
    const output = emitDebugPackage(demoConfig);

    expect(output.contracts).toHaveLength(1);

    const contract = output.contracts[0] as any;
    const user = contract.schemas.entities.User;
    const billingLimit = user.fields.billingLimit.options;

    // Verify meaningful defaults are applied
    expect(billingLimit.required).toBe(false);
    expect(billingLimit.visibility.read).toBe('internal');
    expect(billingLimit.persistence.mode).toBe('stored');

    // Verify false noise is omitted
    expect(billingLimit.nullable).toBeUndefined();
    expect(billingLimit.array).toBeUndefined();

    // Verify relation defaults
    const posts = contract.schemas.entities.Tag.fields.posts.options;

    expect(posts.required).toBe(true);
    expect(posts.array).toBe(true);
    expect(posts.visibility.read).toBe('internal');
    expect(posts.persistence.mode).toBe('virtual');

    // Verify explicit values are preserved
    const email = user.fields.email.options;

    expect(email.capability.select).toBe(false);
    expect(email.visibility.sensitive).toBe(true);
  });

  it('refs do not contain name property', () => {
    const output = emitDebugPackage(demoConfig);

    expect(output.contracts).toHaveLength(1);

    const json = JSON.stringify(output);

    // Ensure no ref contains "name" property (only key)
    // This regex looks for "name":" followed by the same value as key to avoid false positives
    expect(json).not.toMatch(/"name":"[^"]*"[,}]/);

    // Verify a specific ref structure
    const contract = output.contracts[0] as any;
    const user = contract.schemas.entities.User;
    const nameFieldRef = user.fields.name.source.ref;

    expect(nameFieldRef).toHaveProperty('id');
    expect(nameFieldRef).toHaveProperty('kind');
    expect(nameFieldRef).toHaveProperty('key');
    expect(nameFieldRef).not.toHaveProperty('name');
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
