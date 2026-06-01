import { EntityField } from "../entity/field/definition";
import { ModelCategory } from "./definition";

function inferCategories(field: EntityField): ModelCategory[] {
  const categories: ModelCategory[] = [];
  const { visibility, capability, lifecycle, persistence } = field;

  if (visibility?.read === 'public') categories.push('read');
  if (visibility?.write) categories.push('create');
  if (visibility?.write && !persistence?.immutable) categories.push('patch');
  if (capability?.filter || capability?.sort || capability?.select) categories.push('query');
  if (persistence?.mode === 'stored' && visibility?.read !== 'secret') categories.push('projection');
  if (visibility?.sensitive || visibility?.read === 'secret') categories.push('redacted');
  if (persistence?.mode === 'computed' || persistence?.mode === 'virtual') categories.push('derived');
  if (visibility?.read === 'internal' || visibility?.read === 'auth') categories.push('internal');

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