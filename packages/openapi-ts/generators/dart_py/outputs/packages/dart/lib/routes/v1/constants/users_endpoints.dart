class UsersEndpoints {
  const UsersEndpoints();
  String get listUsers => '/users';
  String get createUser => '/users';
  String get getCurrentUser => '/users/me';
  String get updateCurrentUser => '/users/me';
  String getUserById(String userId) => '/users/' + userId;
  String adminUpdateUser(String userId) => '/users/' + userId;
  String deleteUser(String userId) => '/users/' + userId;
  String adminGetUserById(String userId) => '/users/admin/' + userId;
}
