/**
 * GEO SCHEMA ENUMS
 */
export enum EGeoTable {
  Localities = 'localities',
  Languages = 'languages',
  LocalityLanguages = 'locality_languages',
}

/**
 * Hierarchical locality levels
 */
export enum ELocalityType {
  Country = 'country',
  Region = 'region',
  County = 'county',
  City = 'city',
  SubArea = 'sub_area',
  Estate = 'estate',
}

/**
 * Language direction (future-proofing)
 */
export enum ELanguageDirection {
  LTR = 'ltr',
  RTL = 'rtl',
}
