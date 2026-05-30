import { describe, expect, it } from 'vitest';

import { transport } from '@/index';
import { ContentTypeStrategy } from '@/contract/types/transport/definition';

describe('transport helpers', () => {
  it('creates json content type', () => {
    expect(transport.contentType.json()).toEqual({
      value: 'application/json',
      strategy: ContentTypeStrategy.json,
    });
  });

  it('creates json response input', () => {
    const schema = {
      path: '#/schemas/dtos/ErrorResponse',
      kind: 'schema.dto',
      key: 'ErrorResponse',
    } as never;

    expect(transport.response.json(400, schema)).toEqual({
      status: 400,
      schema,
      contentType: 'application/json',
    });
  });
});
