import { definePackageConfig } from 'codepot';
import { v1 } from './v1/version.contract';


export default definePackageConfig({
  contracts: [v1],
  output: {
    folder: 'sdk/openapi/v1',
    filePrefix: 'openapi',  
    formats: ['json', 'yaml'],
  },
  server: {
    url: 'https://api.riderescueautolink.com',
    description: 'RideRescue API',
  },
});
