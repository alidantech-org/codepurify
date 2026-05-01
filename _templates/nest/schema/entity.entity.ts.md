## template: typeorm-entity | output: **entity.name.dash**.entity.ts | language: typescript

```typescript
/* @skipempty */
import * as __entity.typeorm_alias__ from '__entity.typeorm_alias__';
import { __schema_constant__ } from '@/database/constants/schema';
import { I__entity.name.pascal__ } from '__entity.types_import_path__';
/* @if({ entity.has_enum_import }) */
import * as __entity.enum_alias__ from '__entity.enum_import_path__';
/* @endif */
/* @for({ relation in entity.many_to_one_relations }) *//* @if({ relation.target.pascal != entity.name.pascal }) */
import { __relation.target.pascal__Entity } from '@/modules/__relation.target.module__/schema/__relation.target.dash__.entity';
/* @endif *//* @endfor *//* @for({ relation in entity.one_to_one_relations }) *//* @if({ relation.target.pascal != entity.name.pascal }) */
import { __relation.target.pascal__Entity } from '@/modules/__relation.target.module__/schema/__relation.target.dash__.entity';
/* @endif *//* @endfor *//* @for({ relation in entity.one_to_many_relations }) *//* @if({ relation.target.pascal != entity.name.pascal }) */
import { __relation.target.pascal__Entity } from '@/modules/__relation.target.module__/schema/__relation.target.dash__.entity';
/* @endif *//* @endfor */
import { BaseUuidEntity } from '@/database/schema/base-uuid.entity';
/* @endskipempty */

/**
 * __entity.name.pascal__ Entity
 *
 * Auto-generated TypeORM entity for the `__entity.module__` module.
 *
 * This file maps the `__entity.name.pascal__` domain contract to its database
 * representation using the configured schema constant, table constant, columns,
 * indexes, and relations supplied by the entity generation context.
 *
 * The template intentionally keeps formatting close to the final emitted code:
 * imports, decorators, column groups, and relation blocks are rendered directly
 * from context values while empty sections are skipped during generation.
 */

/* @skipempty */
/* @for({ idx in entity.indexes }) */
@__entity.typeorm_alias__.Index([__idx.joined_fields__]/* @if({ idx.unique }) */, { unique: true }/* @endif */)
/* @endfor */
@__entity.typeorm_alias__.Entity({ name: __table_constant__, schema: __schema_constant__.schema })
/* @endskipempty */
export class __entity.name.pascal__Entity extends BaseUuidEntity implements I__entity.name.pascal__ {
  /* @skipempty */
  /* @if({ entity.foreign_columns }) */
// ========================== FOREIGN KEY COLUMNS =========================
  /* @endskipempty */

/* @for({ column in entity.foreign_columns }) */
  @__entity.typeorm_alias__.Column({ name: '__column.db_column_name__'/* @if({ column.nullable }) */, nullable: true/* @endif *//* @if({ column.has_default }) */, default: __column.default_value__/* @endif */ })
  __column.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.enum_columns }) */
  // ========================== ENUM FIELDS =================================

/* @for({ column in entity.enum_columns }) */
  @__entity.typeorm_alias__.Column({ type: 'simple-enum', enum: __column.enum_type__, name: '__column.db_column_name__'/* @if({ column.nullable }) */, nullable: true/* @endif *//* @if({ column.has_default }) */, default: __column.default_value__/* @endif */ })
  __column.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.string_columns }) */
  // ========================== STRING FIELDS ===============================

/* @for({ column in entity.string_columns }) */
  @__entity.typeorm_alias__.Column({ type: '__column.type__'/* @if({ column.has_length }) */, length: __column.length__/* @endif */, name: '__column.db_column_name__'/* @if({ column.nullable }) */, nullable: true/* @endif *//* @if({ column.has_default }) */, default: __column.default_value__/* @endif */ })
  __column.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.number_columns }) */
  // ========================== NUMBER FIELDS ===============================

/* @for({ column in entity.number_columns }) */
  @__entity.typeorm_alias__.Column({ type: '__column.type__', name: '__column.db_column_name__'/* @if({ column.has_precision }) */, precision: __column.precision__/* @endif *//* @if({ column.has_scale }) */, scale: __column.scale__/* @endif *//* @if({ column.nullable }) */, nullable: true/* @endif *//* @if({ column.has_default }) */, default: __column.default_value__/* @endif */ })
  __column.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.boolean_columns }) */
  // ========================== BOOLEAN FIELDS ==============================

/* @for({ column in entity.boolean_columns }) */
  @__entity.typeorm_alias__.Column({ type: 'boolean', name: '__column.db_column_name__'/* @if({ column.nullable }) */, nullable: true/* @endif *//* @if({ column.has_default }) */, default: __column.default_value__/* @endif */ })
  __column.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.json_columns }) */
  // ========================== JSON FIELDS =================================

/* @for({ column in entity.json_columns }) */
  @__entity.typeorm_alias__.Column({ type: 'json', name: '__column.db_column_name__'/* @if({ column.nullable }) */, nullable: true/* @endif *//* @if({ column.has_default }) */, default: __column.default_value__/* @endif */ })
  __column.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.timestamp_columns }) */
  // ========================== TIMESTAMP FIELDS ============================

/* @for({ column in entity.timestamp_columns }) */
  @__entity.typeorm_alias__.Column({ type: 'timestamp with time zone', name: '__column.db_column_name__'/* @if({ column.nullable }) */, nullable: true/* @endif *//* @if({ column.has_default }) */, default: __column.default_value__/* @endif */ })
  __column.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.many_to_one_relations }) */
  // ========================== MANY-TO-ONE RELATIONS =======================
/* @for({ relation in entity.many_to_one_relations }) */
  __relation.decorators__
  readonly __relation.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.one_to_one_relations }) */
  // ========================== ONE-TO-ONE RELATIONS =========================
/* @for({ relation in entity.one_to_one_relations }) */
  __relation.decorators__
  readonly __relation.property_signature__;

/* @endfor *//* @endif *//* @if({ entity.one_to_many_relations }) */
  // ========================== ONE-TO-MANY RELATIONS ========================
/* @for({ relation in entity.one_to_many_relations }) */
  __relation.decorators__
  readonly __relation.property_signature__[];

/* @endfor *//* @endif */}
```
