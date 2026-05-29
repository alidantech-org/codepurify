import { ContentType, defineVersionContract } from 'codepot';

export const v1 = defineVersionContract({
  info: {
    title: 'RideRescue API',
    version: 'v1',
    description: 'RideRescue backend API',
    license: { name: 'MIT', identifier: 'MIT' },
  },
  defaults: { requestContentType: ContentType.json, responseContentType: ContentType.json },
});
