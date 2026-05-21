import 'constants/auth_endpoints.dart';
import 'constants/users_endpoints.dart';
import 'constants/notifications_endpoints.dart';
import 'constants/uploads_endpoints.dart';
import 'constants/reference_documents_endpoints.dart';
import 'constants/required_documents_endpoints.dart';
import 'constants/vehicle_brands_endpoints.dart';
import 'constants/vehicle_services_endpoints.dart';
import 'constants/user_settings_endpoints.dart';
import 'constants/user_vehicles_endpoints.dart';

class V1 {
  V1._();

  static const auth = AuthEndpoints();
  static const users = UsersEndpoints();
  static const notifications = NotificationsEndpoints();
  static const uploads = UploadsEndpoints();
  static const referenceDocuments = ReferenceDocumentsEndpoints();
  static const requiredDocuments = RequiredDocumentsEndpoints();
  static const vehicleBrands = VehicleBrandsEndpoints();
  static const vehicleServices = VehicleServicesEndpoints();
  static const userSettings = UserSettingsEndpoints();
  static const userVehicles = UserVehiclesEndpoints();
}
