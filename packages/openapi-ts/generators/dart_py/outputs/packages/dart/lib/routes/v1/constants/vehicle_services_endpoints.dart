class VehicleServicesEndpoints {
  const VehicleServicesEndpoints();
  String get getAllServices => '/references/vehicles/services/';
  String get createService => '/references/vehicles/services/';
  String getServiceById(String id) => '/references/vehicles/services/' + id;
  String updateService(String id) => '/references/vehicles/services/' + id;
  String deleteService(String id) => '/references/vehicles/services/' + id;
  String toggleServiceStatus(String id) =>
      '/references/vehicles/services/' + id + '/toggle-status';
}
