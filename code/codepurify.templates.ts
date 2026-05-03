import { paths, file } from 'codepurify';
import { defineCodepurifyTemplates } from 'codepurify';

export default defineCodepurifyTemplates({
  rootDir: '__CODEPURIFY_TEMPLATE_ROOT_DIR__',
  templates: [
    // ============================================================================
    // ENTITY TEMPLATES (Core entity definitions)
    // ============================================================================

    {
      name: 'constants',
      templatePath: './constants/constants.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
      fileName: file(paths.entity.names.kebab).suffix('.constants').ext('ts'),
      description: 'Creates entity constants.',
      type: 'entity',
    },

    {
      name: 'entity',
      templatePath: './entity.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
      fileName: file(paths.entity.names.kebab).suffix('.entity').ext('ts'),
      description: 'Creates a TypeORM entity.',
      type: 'entity',
    },

    {
      name: 'schema.entity',
      templatePath: './schema/entity.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
      fileName: file(paths.entity.names.kebab).suffix('.schema').ext('ts'),
      description: 'Creates an entity schema.',
      type: 'entity',
    },

    {
      name: 'dto.create',
      templatePath: './dto.create.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab, 'dto'],
      fileName: file(paths.entity.names.kebab).prefix('create-').suffix('.dto').ext('ts'),
      description: 'Creates a create DTO.',
      type: 'entity',
    },

    {
      name: 'dto.update',
      templatePath: './dto.update.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab, 'dto'],
      fileName: file(paths.entity.names.kebab).prefix('update-').suffix('.dto').ext('ts'),
      description: 'Creates an update DTO.',
      type: 'entity',
    },

    {
      name: 'types.context',
      templatePath: './types/context.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
      fileName: file(paths.entity.names.kebab).suffix('.types').ext('ts'),
      description: 'Creates type context.',
      type: 'entity',
    },

    // ============================================================================
    // RESOURCE TEMPLATES (Supporting resources and utilities)
    // ============================================================================

    {
      name: 'controller',
      templatePath: './controller.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
      fileName: file(paths.entity.names.kebab).suffix('.controller').ext('ts'),
      description: 'Creates a NestJS controller.',
      type: 'resource',
    },

    {
      name: 'repository',
      templatePath: './repository.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
      fileName: file(paths.entity.names.kebab).suffix('.repository').ext('ts'),
      description: 'Creates a TypeORM repository.',
      type: 'resource',
    },

    {
      name: 'service',
      templatePath: './service.ts.hbs',
      outputFolder: [paths.entity.groupKey, paths.entity.names.kebab],
      fileName: file(paths.entity.names.kebab).suffix('.service').ext('ts'),
      description: 'Creates a service.',
      type: 'resource',
    },
  ],
});
