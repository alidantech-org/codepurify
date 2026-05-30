import { describe, expect, it } from 'vitest';

import { defineTransport } from '@/index';

describe('defineTransport', () => {
  it('registers content types and creates refs', () => {
    const transport = defineTransport();

    const contentTypes = transport.defineContentTypes({
      json: transport.contentType.json(),
    });

    expect(contentTypes.ref.json.kind).toBe('transport.contentType');
    expect(transport.snapshot().contentTypes?.json?.value).toBe('application/json');
  });
});
