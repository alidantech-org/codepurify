/**
 * ANALYTICS SCHEMA ENUMS
 */
export enum EAnalyticsTable {
  SearchLogs = 'search_logs',
  AliasSuggestions = 'alias_suggestions',
  BusinessEventLogs = 'business_event_logs',
}

/**
 * Types of search performed
 */
export enum ESearchType {
  Text = 'text',
  Voice = 'voice',
  Suggested = 'suggested',
}

/**
 * Event tracking types
 */
export enum EEventType {
  Search = 'search',
  Click = 'click',
  View = 'view',
  Conversion = 'conversion',
}
