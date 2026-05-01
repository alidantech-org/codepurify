import type { EntityKey } from './database.definition';

/**
 * Defines a comprehensive field array configuration for an entity type.
 * This type organizes entity fields into logical groups based on their usage patterns
 * and operational context, providing a structured approach to field management.
 *
 * @template TEntity - The entity type for which fields are being defined
 *
 * @example
 * ```typescript
 * const APP_FIELDS: DefineKeysArray<IApp> = {
 *   query: {
 *     selectable: ['id', 'name', 'status'],
 *     defaultSelect: ['id', 'name'],
 *     // ... other query fields
 *   },
 *   mutation: {
 *     creatable: ['name', 'description'],
 *     updatable: ['description'],
 *     // ... other mutation fields
 *   },
 *   // ... other field groups
 * };
 * ```
 */
export type DefineKeysArray<TEntity> = {
  /**
   * Query-related field configurations for data retrieval operations.
   * These fields define what can be selected, filtered, sorted, and searched
   * when querying the entity from the database or API.
   */
  query: {
    /**
     * All fields that can be selected in queries.
     * This represents the complete set of fields that are available for
     * explicit selection when retrieving entity data.
     */
    selectable: readonly EntityKey<TEntity>[];

    /**
     * Default fields selected when no specific fields are requested.
     * These fields are returned by default in query operations to provide
     * essential entity information without overwhelming the response.
     */
    defaultSelect: readonly EntityKey<TEntity>[];

    /**
     * Fields that can be used for sorting query results.
     * These fields support ordering operations in database queries,
     * allowing clients to sort results by specified criteria.
     */
    sortable: readonly EntityKey<TEntity>[];

    /**
     * Fields that support text-based search operations.
     * These fields can be searched using full-text or pattern matching
     * search functionality for finding entities based on content.
     */
    searchable: readonly EntityKey<TEntity>[];

    /**
     * Fields that can be used for filtering query results.
     * These fields support where-clauses and filtering conditions,
     * enabling precise data retrieval based on specific criteria.
     */
    filterable: readonly EntityKey<TEntity>[];

    /**
     * Fields that support date range filtering operations.
     * These are typically date/timestamp fields that can be filtered
     * using start and end date boundaries for temporal queries.
     */
    dateRange: readonly EntityKey<TEntity>[];
  };

  /**
   * Mutation-related field configurations for data modification operations.
   * These fields define what can be created, updated, and modified when
   * performing write operations on the entity.
   */
  mutation: {
    /**
     * Fields that can be created during standard entity creation.
     * These fields are available to regular users when creating new entities,
     * excluding system-level or administrative fields.
     */
    creatable: readonly EntityKey<TEntity>[];

    /**
     * Fields that can be created during system-level entity creation.
     * These fields include additional administrative or system fields that
     * are only available to system processes or privileged operations.
     */
    systemCreatable: readonly EntityKey<TEntity>[];

    /**
     * Fields that can be updated in existing entities.
     * These fields represent the subset of entity properties that can be
     * modified after the entity has been created.
     */
    updatable: readonly EntityKey<TEntity>[];

    /**
     * All fields that can be edited (combination of creatable and updatable).
     * This represents the complete set of fields that can be modified throughout
     * the entity lifecycle, including both creation and update operations.
     */
    editable: readonly EntityKey<TEntity>[];

    /**
     * Fields that are read-only and cannot be modified.
     * These fields are managed by the system and cannot be changed by users,
     * typically including auto-generated values and audit fields.
     */
    readonly: readonly EntityKey<TEntity>[];

    /**
     * Fields that are immutable and cannot be changed after creation.
     * These fields can only be set during entity creation and remain constant
     * throughout the entity's lifetime, ensuring data integrity.
     */
    immutable: readonly EntityKey<TEntity>[];
  };

  /**
   * Relation-related field configurations for entity relationships.
   * These fields define how the entity relates to other entities in the system.
   */
  relation: {
    /**
     * Fields that represent relations to other entities.
     * These are typically foreign key fields or relationship properties that
     * connect this entity to other entities in the data model.
     */
    keys: readonly EntityKey<TEntity>[];
  };

  /**
   * State-related field configurations for entity state management.
   * These fields control the entity's state transitions and boolean toggles.
   */
  state: {
    /**
     * Fields that can transition between different discrete states.
     * These fields represent state machines or status fields that can change
     * between predefined values according to business rules.
     */
    transition: readonly EntityKey<TEntity>[];

    /**
     * Fields that can be toggled between boolean states.
     * These are binary fields that can be switched on/off, representing
     * flags, switches, or boolean settings.
     */
    toggle: readonly EntityKey<TEntity>[];
  };

  /**
   * Business-related field configurations for business logic.
   * These fields contain information relevant to business operations and context.
   */
  business: {
    /**
     * Fields that provide contextual business information.
     * These fields contain business context, ownership information, or other
     * business-relevant data that helps understand the entity's business context.
     */
    contextual: readonly EntityKey<TEntity>[];
  };

  /**
   * Security-related field configurations for access control.
   * These fields manage security aspects and sensitive information handling.
   */
  security: {
    /**
     * Fields that contain sensitive information.
     * These fields require special handling for privacy and security,
     * may be masked, encrypted, or have restricted access.
     */
    sensitive: readonly EntityKey<TEntity>[];
  };

  /**
   * System-related field configurations for system management.
   * These fields handle system-level concerns and technical aspects.
   */
  system: {
    /**
     * Fields that are persisted in the database.
     * These fields represent the actual data stored for the entity,
     * excluding computed or transient values.
     */
    persisted: readonly EntityKey<TEntity>[];

    /**
     * Fields that are computed at runtime.
     * These fields are not stored in the database but calculated
     * dynamically based on other fields or external data sources.
     */
    computed: readonly EntityKey<TEntity>[];
  };
};
