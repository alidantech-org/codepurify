/**
 * COMMERCE SCHEMA ENUMS
 */
export enum ECommerceTable {
  MeasurementUnits = 'measurement_units',
  TaxonomyNodeUnits = 'taxonomy_node_units',
  TaxonomyNodePricingModels = 'taxonomy_node_pricing_models',
  TaxonomyNodePricingMeasurements = 'taxonomy_node_pricing_measurements',
}

/**
 * Measurement unit categories
 */
export enum EUnitType {
  Weight = 'weight',
  Volume = 'volume',
  Count = 'count',
  Time = 'time',
  Packaging = 'packaging',
  Informal = 'informal', // e.g. heap, bunch
}

/**
 * Optional grouping for advanced use later
 */
export enum EUnitGroup {
  Metric = 'metric',
  Market = 'market',
  Time = 'time',
}
