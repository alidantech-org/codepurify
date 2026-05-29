import { definePackageConfig } from 'codepot';

export default definePackageConfig({
  contracts: [],
  output: {
    folder: '.codepot',
    filePrefix: 'codepot',
    formats: ['json', 'yaml'],
  },
  server: {
    url: 'https://api.example.com',
    description: 'API',
  },
});
