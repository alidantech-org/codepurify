class UsersEndpoints {
  const UsersEndpoints();

  /// Get a paginated list of all users (admin only).
  String get getAllUsers => '/users/';

  /// Get a specific user by ID (admin only).
  String getUserById(String id) => '/users/$id';

  /// Update a specific user by ID (admin only).
  String updateUser(String id) => '/users/$id';

  /// Delete a specific user by ID (admin only).
  String deleteUser(String id) => '/users/$id';

  /// Get the authenticated user profile.
  String get getCurrentUser => '/users/profile/me';

  /// Update the authenticated user profile.
  String get updateCurrentUser => '/users/profile/me';
}
