# Notifications API

## getMyNotifications

`GET` `/notifications/me` 

Get my notifications

Get notifications for the authenticated user.

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `IsReadQueryParam` | ref | - | Reference parameter |
| `CategoryQueryParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `NotificationsListOkResponse` |

---
## getUnreadNotificationCount

`GET` `/notifications/me/unread-count` 

Get unread notification count

Get the count of unread notifications for the authenticated user.

### Parameters

No parameters.

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `UnreadCountOkResponse` |

---
## getNotificationById

`GET` `/notifications/{id}` 

Get notification by ID

Get a specific notification by ID.

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `NotificationIdPathParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `NotificationProfileOkResponse` |

---
## deleteNotification

`DELETE` `/notifications/{id}` 

Delete notification

Delete a specific notification.

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `NotificationIdPathParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `MessageOnlyOkResponse` |

---
## markNotificationAsRead

`PATCH` `/notifications/{id}/read` 

Mark notification as read

Mark a specific notification as read.

### Parameters

| Name | In | Required | Description |
|---|---|---:|---|
| `NotificationIdPathParam` | ref | - | Reference parameter |

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `NotificationProfileOkResponse` |

---
## markAllNotificationsAsRead

`PATCH` `/notifications/me/read-all` 

Mark all notifications as read

Mark all notifications for the authenticated user as read.

### Parameters

No parameters.

### Request Body

No request body.

### Responses

| Status | Description |
|---|---|
| `200` | `MessageOnlyOkResponse` |

---
## createNotification

`POST` `/notifications/` 

Create notification

Create a new notification.

### Parameters

No parameters.

### Request Body

`CreateNotificationRequestBody` 

### Responses

| Status | Description |
|---|---|
| `201` | `NotificationProfileOkResponse` |

---
