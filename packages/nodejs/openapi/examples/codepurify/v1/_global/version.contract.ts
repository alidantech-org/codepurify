import { ContentType, defineVersionContract } from 'codepot-openapi';

export const v1 = defineVersionContract({
  info: {
    title: 'Codepurify API',
    version: 'v1',
    description: 'Codepurify backend API',
    license: { name: 'MIT', identifier: 'MIT' },
  },
  defaults: {
    requestContentType: ContentType.json,
    responseContentType: ContentType.json,
  },
});
