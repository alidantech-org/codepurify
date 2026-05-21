class VehicleServicesEndpoints {
  const VehicleServicesEndpoints();

  /// Get a paginated list of all vehicle services.
  String get getAllServices => '/references/vehicles/services/';

  /// Create a new vehicle service (admin only).
  String get createService => '/references/vehicles/services/';

  /// Get a specific vehicle service by ID.
  String getServiceById(String id) => '/references/vehicles/services/$id';

  /// Update a specific vehicle service by ID (admin only).
  String updateService(String id) => '/references/vehicles/services/$id';

  /// Delete a specific vehicle service by ID (admin only).
  String deleteService(String id) => '/references/vehicles/services/$id';

  /// Toggle the active status of a vehicle service (admin only).
  String toggleServiceStatus(String id) =>
      '/references/vehicles/services/$id/toggle-status';
}
