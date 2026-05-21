class NotificationsEndpoints {
  const NotificationsEndpoints();
  String get getMyNotifications => '/notifications/me';
  String get getUnreadNotificationCount => '/notifications/me/unread-count';
  String getNotificationById(String id) => '/notifications/' + id;
  String deleteNotification(String id) => '/notifications/' + id;
  String markNotificationAsRead(String id) => '/notifications/' + id + '/read';
  String get markAllNotificationsAsRead => '/notifications/me/read-all';
  String get createNotification => '/notifications/';
}
