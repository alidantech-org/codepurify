import { EntityField } from "../entity/field/definition";
import { ModelCategory } from "./definition";

function inferCategories(field: EntityField): ModelCategory[] {
  const categories: ModelCategory[] = [];
  const { access, query, persistence } = field;

  if (access?.read === 'public') categories.push('read');
  if (access?.write) categories.push('create');
  if (access?.write && !persistence?.immutable) categories.push('patch');
  if (query?.filter || query?.sort || query?.select) categories.push('query');
  if (persistence?.mode === 'stored' && access?.read !== 'secret') categories.push('projection');
  if (access?.sensitive || access?.read === 'secret') categories.push('redacted');
  if (persistence?.mode === 'computed' || persistence?.mode === 'virtual') categories.push('derived');
  if (access?.read === 'internal' || access?.read === 'auth') categories.push('internal');

  return categories;
}

// export function buildModel(entity: EntityDefinition, category: ModelCategory): EntityField[] {
//   return entity.fields.filter((f) => inferCategories(f).includes(category));
// }

// e.g.
// const CreateUserModel = buildModel(UserEntity, 'create');
// const PublicUserModel = buildModel(UserEntity, 'read');
// const PatchUserModel = buildModel(UserEntity, 'patch');
// const UserQueryFilters = buildModel(UserEntity, 'query');