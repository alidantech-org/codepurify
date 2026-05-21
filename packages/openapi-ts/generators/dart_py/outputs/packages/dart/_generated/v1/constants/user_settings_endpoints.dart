class UserSettingsEndpoints {
  const UserSettingsEndpoints();

  /// Get settings for the authenticated user.
  String get getMySettings => '/users/settings/';

  /// Update settings for the authenticated user.
  String get updateMySettings => '/users/settings/';

  /// Update notification category preference for the authenticated user.
  String updateNotificationCategory(String category) =>
      '/users/settings/notifications/categories/$category';

  /// Reset settings to default for the authenticated user.
  String get resetMySettings => '/users/settings/reset';
}
