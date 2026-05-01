## template: repository | output: **entity.name.dash**.repository.ts | language: typescript

```typescript
/* @skipempty */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as __entity.typeorm_alias__ from 'typeorm';

import { BaseRepository } from '@/database/repository/base.repository';
import { __entity.name.pascal__Entity } from '@/modules/__entity.module__/schema/__entity.name.dash__.entity';
import * as __entity.types_alias__ from '__entity.types_import_path__';
/* @if({ entity.has_enum_import }) */
import * as __entity.enum_alias__ from '__entity.enum_import_path__';
/* @endif */
import { IFindAllResponse } from '../shared/response';
import { InternalFindOptions } from '../shared/query';
import { IBaseItemQuery, IBaseListQuery } from '../shared/query';
/* @endskipempty */

/**
 * __entity.name.pascal__Repository
 *
 * Auto-generated TypeORM repository for the `__entity.module__` module.
 *
 * This repository binds `__entity.name.pascal__Entity` to the shared
 * BaseRepository query compiler. It keeps domain-specific read helpers,
 * validation helpers, relationship-scoped finders, slug lookup helpers, and
 * internal repository accessors close to the entity they operate on.
 *
 * The template intentionally mirrors the final emitted TypeScript shape:
 * imports, constructor configuration, grouped methods, and JSDoc comments are
 * rendered directly from context while empty sections are skipped.
 */
@Injectable()
export class __entity.name.pascal__Repository extends BaseRepository<
  __entity.interface_type_ref__,
  __entity.sortable_field_ref__,
  __entity.relation_key_ref__,
  __entity.selectable_field_ref__,
  __entity.filterable_field_ref__,
  __entity.date_range_field_ref__,
  __entity.item_query_ref__,
  __entity.list_query_ref__,
  Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>,
  __entity.typeorm_alias__.DeepPartial<__entity.interface_type_ref__>,
  __entity.typeorm_alias__.DeepPartial<__entity.interface_type_ref__>,
  typeof __entity.one_relation_query_ref__,
  typeof __entity.many_relation_query_ref__
> {
  constructor(
    @InjectRepository(__entity.name.pascal__Entity)
    repo: __entity.typeorm_alias__.Repository<__entity.name.pascal__Entity>,
  ) {
    super(repo, __entity.query_options_ref__);
  }
/* @skipempty */
/* @if({ entity.foreign_key_finders }) */

  // ==================== FOREIGN KEY FINDERS ====================

/* @for({ finder in entity.foreign_key_finders }) */
  /**
   * __finder.description__
   *
   * JUSTIFICATION:
__finder.justification_lines__
   */
  async __finder.method_name__(
    query: __entity.query_dto_ref__,
    __finder.param_name__: __finder.param_type__,
  ): Promise<IFindAllResponse<__entity.name.pascal__Entity>> {
    return await this.findByQuery(query, {
      __finder.field_name__: __finder.param_name__,
      deletedAt: __entity.typeorm_alias__.IsNull(),
    });
  }

/* @endfor */
/* @endif */
/* @endskipempty */
/* @skipempty */
/* @if({ entity.foreign_key_pairs }) */

  // ==================== FOREIGN KEY PAIR FINDERS ====================

/* @for({ pair in entity.foreign_key_pairs }) */
  /**
   * __pair.description__
   *
   * JUSTIFICATION:
__pair.justification_lines__
   */
  async __pair.method_name__(
    query: __entity.query_dto_ref__,
    __pair.left_param_name__: string,
    __pair.right_param_name__: string,
  ): Promise<IFindAllResponse<__entity.name.pascal__Entity>> {
    return await this.findByQuery(query, {
      __pair.left_field_name__: __pair.left_param_name__,
      __pair.right_field_name__: __pair.right_param_name__,
      deletedAt: __entity.typeorm_alias__.IsNull(),
    });
  }

/* @endfor */
/* @endif */
/* @endskipempty */
/* @skipempty */
/* @if({ entity.has_slug }) */

  // ==================== SLUG FINDERS ====================

  /**
   * Find one __entity.name.dash__ record by slug.
   *
   * JUSTIFICATION:
   * - Slug is a stable public lookup key.
   * - Supports URL-based entity resolution.
   * - Uses the BaseRepository item query path for fields and includes.
   */
  async findBySlug(
    slug: string,
    query?: IBaseItemQuery<
      __entity.name.pascal__Entity,
      __entity.relation_key_ref__,
      __entity.selectable_field_ref__
    >,
  ): Promise<__entity.name.pascal__Entity | null> {
    return await this.findOne({ slug } as Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>, query);
  }

  /**
   * Check whether a slug already exists.
   *
   * JUSTIFICATION:
   * - Prevents duplicate slug values before writes.
   * - Supports update flows through optional ID exclusion.
   * - Keeps uniqueness checks centralized in the repository.
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: __entity.typeorm_alias__.FindOptionsWhere<__entity.name.pascal__Entity> = { slug };

    if (excludeId) filter.id = __entity.typeorm_alias__.Not(excludeId);

    return await this.exists(filter as Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>);
  }

/* @endif */
/* @endskipempty */
/* @skipempty */
/* @if({ entity.module_queries }) */

  // ==================== DOMAIN-SPECIFIC QUERIES ====================

/* @for({ query in entity.module_queries }) */
  /**
   * __query.description__
   *
   * JUSTIFICATION:
__query.justification_lines__
   */
  async __query.method_name__(
    query: __entity.query_dto_ref____query.parameter_signature__
  ): Promise<IFindAllResponse<__entity.name.pascal__Entity>> {
    return await this.findByQuery(query, {
__query.filter_entries__
      deletedAt: __entity.typeorm_alias__.IsNull(),
    });
  }

/* @endfor */
/* @endif */
/* @endskipempty */
/* @skipempty */
/* @if({ entity.validation_helpers }) */

  // ==================== VALIDATION HELPERS ====================

/* @for({ validation in entity.validation_helpers }) */
  /**
   * __validation.description__
   *
   * JUSTIFICATION:
__validation.justification_lines__
   */
  async __validation.method_name__(__validation.parameter_signature__): Promise<boolean> {
    const filter: __entity.typeorm_alias__.FindOptionsWhere<__entity.name.pascal__Entity> = {
__validation.filter_entries__
    };

/* @if({ validation.exclude_id_param }) */
    if (__validation.exclude_id_param__) filter.id = __entity.typeorm_alias__.Not(__validation.exclude_id_param__);
/* @endif */

    return await this.exists(filter as Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>);
  }

/* @endfor */
/* @endif */
/* @endskipempty */
/* @skipempty */
/* @if({ entity.relationship_helpers }) */

  // ==================== RELATIONSHIP HELPERS ====================

/* @for({ helper in entity.relationship_helpers }) */
  /**
   * __helper.description__
   *
   * JUSTIFICATION:
__helper.justification_lines__
   */
  async __helper.method_name__(__helper.parameter_signature__): Promise<__helper.return_type__> {
/* @if({ helper.returns_boolean }) */
    return await this.exists({
__helper.filter_entries__
      deletedAt: __entity.typeorm_alias__.IsNull(),
    } as Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>);
/* @endif *//* @if({ helper.returns_entities }) */
    return await this.internalFind({
      filter: {
__helper.filter_entries__
        deletedAt: __entity.typeorm_alias__.IsNull(),
      } as Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>,
    });
/* @endif */
  }

/* @endfor */
/* @endif */
/* @endskipempty */

  // ==================== INTERNAL ====================

  /**
   * Internal find helper for __entity.name.dash__ records.
   *
   * JUSTIFICATION:
   * - Provides a generated, entity-named wrapper around BaseRepository.internalFind.
   * - Keeps internal callers type-safe without exposing TypeORM directly.
   * - Applies soft-delete filtering by default.
   */
  async internalFindMany__entity.name.pascal__(
    options: InternalFindOptions<__entity.interface_type_ref__, __entity.key_ref__>,
  ): Promise<__entity.interface_type_ref__[]> {
    return await this.internalFind({
      filter: {
        ...(options.filters ?? {}),
        deletedAt: __entity.typeorm_alias__.IsNull(),
      } as Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>,
      take: options.take,
      select: options.select as readonly __entity.selectable_field_ref__[] | undefined,
    });
  }
/* @skipempty */
/* @if({ entity.internal_methods }) */

/* @for({ internal in entity.internal_methods }) */
  /**
   * __internal.description__
   *
   * JUSTIFICATION:
__internal.justification_lines__
   */
  async __internal.method_name__(
    options: InternalFindOptions<__entity.name.pascal__Entity>,
  ): Promise<__entity.name.pascal__Entity[]> {
    return await this.internalFind({
      filter: {
        ...(options.filters ?? {}),
        deletedAt: __entity.typeorm_alias__.IsNull(),
      } as Partial<Pick<__entity.name.pascal__Entity, __entity.filterable_field_ref__>>,
      take: options.take,
      select: options.select as readonly __entity.selectable_field_ref__[] | undefined,
    });
  }

/* @endfor */
/* @endif */
/* @endskipempty */
/* @skipempty */
/* @if({ entity.bulk_methods }) */

  // ==================== BULK UPDATE METHODS ====================

/* @for({ bulk_method in entity.bulk_methods }) */
  /**
   * __bulk_method.description__
   *
__bulk_method.param_doc_lines__
   * @param manager EntityManager for transaction scope.
   * @returns __bulk_method.return_description__
   */
  async __bulk_method.method_name__(
__bulk_method.parameter_lines__
    manager: typeorm.EntityManager,
  ): Promise<__bulk_method.return_type__> {
    const ZERO_COUNT = 0;
/* @if({ bulk_method.validation_checks }) */

__bulk_method.validation_check_lines__
/* @endif *//* @if({ bulk_method.setup_code }) */

__bulk_method.setup_code_lines__
/* @endif */

    const result = await manager
      .getRepository(__entity.name.pascal__Entity)
      .createQueryBuilder()
      .update(__entity.name.pascal__Entity)
      .set({
__bulk_method.set_field_entries__
      })
      .where(`"id" IN (:...ids)`, {
        ...params,
        ids,
      })
      .execute();

    return result.affected ?? ZERO_COUNT;
  }

/* @endfor */
/* @endif */
/* @endskipempty */
}
```
