// lib/server/api/api_versions.dart

/// Represents an API version used to scope requests.
///
/// Set per request for screen-level clarity.
/// Use [ApiVersion.defaultVersion] as the app-wide fallback.
///
/// To deprecate a version, annotate it with [_deprecated] and
/// set [isDeprecated] to true. The [ApiClient] will emit a warning
/// in debug mode when a deprecated version is used.
enum ApiVersion {
  /// Current stable version.
  v1(path: '/v1'),

  /// Next version — in development.
  v2(path: '/v2');

  const ApiVersion({required this.path});

  /// URL path segment for this version e.g. `/v1`.
  final String path;

  /// Whether this version is deprecated.
  /// Set to true and add a [deprecationMessage] when phasing out.
  bool get isDeprecated => switch (this) {
        ApiVersion.v1 => false,
        ApiVersion.v2 => false,
      };

  /// Human-readable deprecation message shown in debug warnings.
  String? get deprecationMessage => switch (this) {
        ApiVersion.v1 => null,
        ApiVersion.v2 => null,
      };

  /// App-level default — change this constant when promoting a new version.
  static const ApiVersion defaultVersion = ApiVersion.v1;
}
