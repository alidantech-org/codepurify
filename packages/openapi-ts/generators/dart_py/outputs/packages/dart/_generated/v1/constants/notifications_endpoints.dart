class NotificationsEndpoints {
  const NotificationsEndpoints();

  /// Get notifications for the authenticated user.
  String get getMyNotifications => '/notifications/me';

  /// Get the count of unread notifications for the authenticated user.
  String get getUnreadCount => '/notifications/me/unread-count';

  /// Get a specific notification by ID.
  String getNotificationById(String id) => '/notifications/$id';

  /// Delete a specific notification.
  String deleteNotification(String id) => '/notifications/$id';

  /// Mark a specific notification as read.
  String markNotificationAsRead(String id) => '/notifications/$id/read';

  /// Mark all notifications for the authenticated user as read.
  String get markAllNotificationsAsRead => '/notifications/me/read-all';

  /// Create a new notification.
  String get createNotification => '/notifications/';
}
