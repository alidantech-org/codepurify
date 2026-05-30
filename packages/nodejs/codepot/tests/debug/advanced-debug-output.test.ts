import { describe, expect, it } from 'vitest';

import { emitDebugPackage, writeDebugPackageJson } from '@/index';

import { advancedConfig } from '@/tests/fixtures/contracts/advanced.contract';

describe('advanced debug authoring output', () => {
  it('emits advanced collected authoring intent', () => {
    const output = emitDebugPackage(advancedConfig);
    const json = JSON.stringify(output);

    expect(output.contracts).toHaveLength(1);

    expect(json).toContain('advanced_demo_api');

    expect(json).toContain('property:primitive:id');
    expect(json).toContain('property:enum:UserRole');
    expect(json).toContain('property:enum:TicketStatus');
    expect(json).toContain('property:enum:OrderStatus');

    expect(json).toContain('schema:entity:BaseEntity:field:id');
    expect(json).toContain('schema:entity:User:field:roles');
    expect(json).toContain('schema:entity:Event:field:title');
    expect(json).toContain('schema:entity:Ticket:field:price');
    expect(json).toContain('schema:entity:Order');

    expect(json).toContain('schema:model:User:read');
    expect(json).toContain('schema:model:Event:query');
    expect(json).toContain('schema:model:Ticket:read');
    expect(json).toContain('schema:model:Order:read');

    expect(json).toContain('schema:dto:CreateEventBody');
    expect(json).toContain('schema:dto:PatchEventBody');
    expect(json).toContain('schema:dto:CreateOrderBody');
    expect(json).toContain('schema:dto:OrderSummaryResponse');

    expect(json).toContain('schema:params:IdParams');
    expect(json).toContain('schema:params:SlugParams');

    expect(json).toContain('transport:request:CreateEventRequest');
    expect(json).toContain('transport:request:PatchEventRequest');
    expect(json).toContain('transport:request:CreateOrderRequest');

    expect(json).toContain('transport:response:BadRequest');
    expect(json).toContain('transport:response:EventResponse');
    expect(json).toContain('transport:response:OrderResponse');

    expect(json).toContain('security:scheme:bearer');
    expect(json).toContain('security:scheme:apiKey');
    expect(json).toContain('security:auth:jwt');
    expect(json).toContain('security:auth:apiKey');
    expect(json).toContain('security:role_source:userRoles');
    expect(json).toContain('security:role_set:adminsOrManagers');
    // Contexts and guards not yet implemented
    // expect(json).toContain('security:context:tenantMember');
    // expect(json).toContain('security:guard:tenantMemberGuard');

    expect(json).toContain('resource:users:operation:listUsers');
    expect(json).toContain('resource:events:operation:createEvent');
    expect(json).toContain('resource:orders:operation:createOrder');

    expect(json).toContain('"extendWith"');
    expect(json).toContain('"array":true');
    expect(json).toContain('"nullable":true');
    expect(json).toContain('"required":false');

    expect(json).not.toContain('"$ref"');
    expect(json).not.toContain('#/schemas');
    expect(json).not.toContain('#/transport');
    expect(json).not.toContain('#/security');
  });

  it('writes advanced debug json string', () => {
    const json = writeDebugPackageJson(advancedConfig);

    expect(json).toContain('advanced_demo_api');
    expect(json).toContain('resource:events:operation:patchEvent');
    // Contexts and guards not yet implemented
    // expect(json).toContain('security:guard:tenantMemberGuard');
    expect(json).not.toContain('"$ref"');
  });
});
