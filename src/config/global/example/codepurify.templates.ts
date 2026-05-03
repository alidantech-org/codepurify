import { paths, file } from '@/config/global/types/codepurify.templates.types';
import { defineCodepurifyTemplates } from '@/config/global/helpers/define-templates';

export const dtoCreateTemplate = {
  name: 'dto.create',
  templatePath: 'nestjs/dto/create.hbs',
  outputFolder: [paths.entity.groupKey, paths.entity.names.kebab, 'dto'],
  fileName: file(paths.entity.names.kebab).prefix('create-').suffix('.dto').ext('ts'),
  description: 'Creates a NestJS create DTO.',
} as const;

export const dtoUpdateTemplate = {
  name: 'dto.update',
  templatePath: 'nestjs/dto/update.hbs',
  outputFolder: [paths.entity.groupKey, paths.entity.names.kebab, 'dto'],
  fileName: file(paths.entity.names.kebab).prefix('update-').suffix('.dto').ext('ts'),
  description: 'Creates a NestJS update DTO.',
} as const;

export const typeormEntityTemplate = {
  name: 'typeorm.entity',
  templatePath: 'typeorm/entity.hbs',
  outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
  fileName: file(paths.entity.names.kebab).suffix('.entity').ext('ts'),
  description: 'Creates a TypeORM entity.',
} as const;

export default defineCodepurifyTemplates({
  rootDir: './codepurify/templates',
  templates: [dtoCreateTemplate, dtoUpdateTemplate, typeormEntityTemplate],
});
