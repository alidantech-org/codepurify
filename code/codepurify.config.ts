import { defineCodepurifyConfig } from 'codepurify';

export default defineCodepurifyConfig({
  rootDir: process.cwd(),
  outputDir: './src/generated',
  manifestPath: './codepurify/manifest.json',
});
