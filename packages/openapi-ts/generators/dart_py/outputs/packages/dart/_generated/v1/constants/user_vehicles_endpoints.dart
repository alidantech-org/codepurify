class UserVehiclesEndpoints {
  const UserVehiclesEndpoints();

  /// Create a new vehicle for the authenticated user.
  String get createVehicle => '/users/vehicles/';

  /// Get all vehicles for the authenticated user.
  String get getAllVehicles => '/users/vehicles/';

  /// Get a specific vehicle by ID.
  String getVehicleById(String id) => '/users/vehicles/$id';

  /// Update a specific vehicle by ID.
  String updateVehicle(String id) => '/users/vehicles/$id';

  /// Delete a specific vehicle by ID.
  String deleteVehicle(String id) => '/users/vehicles/$id';

  /// Get all vehicles for the authenticated user.
  String get getMyVehicles => '/users/vehicles/me';

  /// Update the status of a specific vehicle.
  String updateVehicleStatus(String id) => '/users/vehicles/$id/status';

  /// Update documents for a specific vehicle.
  String updateVehicleDocuments(String id) => '/users/vehicles/$id/documents';

  /// Update insurance for a specific vehicle.
  String updateVehicleInsurance(String id) => '/users/vehicles/$id/insurance';
}
