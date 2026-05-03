import { paths, file } from 'codepurify';
import { defineCodepurifyTemplates } from 'codepurify';

export const dtoCreateTemplate = {
  name: 'dto.create',
  templatePath: '/dto/create.hbs',
  outputFolder: [paths.entity.groupKey, paths.entity.names.kebab, 'dto'],
  fileName: file(paths.entity.names.kebab).prefix('create-').suffix('.dto').ext('ts'),
  description: 'Creates a NestJS create DTO.',
} as const;

export const dtoUpdateTemplate = {
  name: 'dto.update',
  templatePath: '/dto/update.hbs',
  outputFolder: [paths.entity.groupKey, paths.entity.names.kebab, 'dto'],
  fileName: file(paths.entity.names.kebab).prefix('update-').suffix('.dto').ext('ts'),
  description: 'Creates a NestJS update DTO.',
} as const;

export const typeormEntityTemplate = {
  name: 'typeorm.entity',
  templatePath: '/entity.hbs',
  outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
  fileName: file(paths.entity.names.kebab).suffix('.entity').ext('ts'),
  description: 'Creates a TypeORM entity.',
} as const;

export default defineCodepurifyTemplates({
  rootDir: './code/templates',
  templates: [dtoCreateTemplate, dtoUpdateTemplate, typeormEntityTemplate],
});
