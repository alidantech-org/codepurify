import { v1 } from './version.contract';
import { sharedContract } from './shared.resource';

v1.setDefaultResponses({
  400: sharedContract.sharedSchemas.ref.ApiMessage,
  401: sharedContract.sharedSchemas.ref.ApiMessage,
  403: sharedContract.sharedSchemas.ref.ApiMessage,
  404: sharedContract.sharedSchemas.ref.ApiMessage,
  422: { schema: sharedContract.sharedSchemas.ref.ApiMessage, description: 'Validation failed' },
  500: sharedContract.sharedSchemas.ref.ApiMessage,
});
