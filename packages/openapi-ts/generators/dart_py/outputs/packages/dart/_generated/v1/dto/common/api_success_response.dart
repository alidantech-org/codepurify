class ApiSuccessResponse<T> {
  final bool success;
  final String message;
  final T? data;

  const ApiSuccessResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory ApiSuccessResponse.fromJson(
    dynamic json, [
    T Function(dynamic json)? fromJsonT,
  ]) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return ApiSuccessResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? '',
      data: fromJsonT == null || map['data'] == null
          ? null
          : fromJsonT(map['data']),
    );
  }
}
