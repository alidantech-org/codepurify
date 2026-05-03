import { defineCodepurifyConfig } from '@/config/global/helpers/define-config';

export default defineCodepurifyConfig({
  rootDir: process.cwd(),
  outputDir: './src/generated',
  manifestPath: './codepurify/manifest.json',
});
