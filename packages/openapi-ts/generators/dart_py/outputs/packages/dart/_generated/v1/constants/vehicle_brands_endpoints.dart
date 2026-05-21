class VehicleBrandsEndpoints {
  const VehicleBrandsEndpoints();

  /// Get a paginated list of all vehicle brands.
  String get getAllBrands => '/references/vehicles/brands/';

  /// Create a new vehicle brand (admin only).
  String get createBrand => '/references/vehicles/brands/';

  /// Get a specific vehicle brand by ID.
  String getBrandById(String id) => '/references/vehicles/brands/$id';

  /// Update a specific vehicle brand by ID (admin only).
  String updateBrand(String id) => '/references/vehicles/brands/$id';

  /// Delete a specific vehicle brand by ID (admin only).
  String deleteBrand(String id) => '/references/vehicles/brands/$id';

  /// Toggle the active status of a vehicle brand (admin only).
  String toggleBrandStatus(String id) =>
      '/references/vehicles/brands/$id/toggle-status';
}
