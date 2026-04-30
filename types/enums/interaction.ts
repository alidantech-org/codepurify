/**
 * INTERACTION SCHEMA ENUMS
 */
export enum EInteractionTable {
  SoftOrders = 'soft_orders',
  Bookings = 'bookings',
  Reservations = 'reservations',
  QuoteRequests = 'quote_requests',
  Reviews = 'reviews',
}

/**
 * Order lifecycle
 */
export enum EOrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

/**
 * Booking lifecycle
 */
export enum EBookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

/**
 * Quote request lifecycle
 */
export enum EQuoteStatus {
  Requested = 'requested',
  Responded = 'responded',
  Accepted = 'accepted',
  Rejected = 'rejected',
}
