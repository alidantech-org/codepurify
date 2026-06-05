# Riderescue Dart SDK Generation

Use this command from the generator package:

```powershell
cd C:\Users\peter\Projects\packages\codepurify\packages\python\apigen
```

Run a dry run first:

```powershell
python -m cli.main emit `
  --input C:\Users\peter\Projects\work\riderescue\backend\sdk\openapi\v1\openapi.v1.yaml `
  --language dart `
  --output C:\Users\peter\Projects\work\riderescue\backend\sdk\packages\.dart `
  --templates templates\dart `
  --dry-run `
  --verbose
```

Generate the Dart SDK:

```powershell
python -m cli.main emit `
  --input C:\Users\peter\Projects\work\riderescue\backend\sdk\openapi\v1\openapi.v1.yaml `
  --language dart `
  --output C:\Users\peter\Projects\work\riderescue\backend\sdk\packages\.dart `
  --templates templates\dart `
  --verbose
```

## Git Bash

Use this command from the generator package:

```bash
cd /c/Users/peter/Projects/packages/codepurify/packages/python/apigen
```

Run a dry run first:

```bash
python -m cli.main emit \
  --input /c/Users/peter/Projects/work/riderescue/backend/sdk/openapi/v1/openapi.v1.yaml \
  --language dart \
  --output /c/Users/peter/Projects/work/riderescue/backend/sdk/packages/.dart \
  --templates templates/dart \
  --dry-run \
  --verbose
```

Generate the Dart SDK:

```bash
python -m cli.main emit \
  --input /c/Users/peter/Projects/work/riderescue/backend/sdk/openapi/v1/openapi.v1.yaml \
  --language dart \
  --output /c/Users/peter/Projects/work/riderescue/backend/sdk/packages/.dart \
  --templates templates/dart \
  --verbose
```

## Runtime Bridge Pattern

The Flutter app should initialize and own the `flutter_api_bridge` configuration.
`ApiClient` configures the bridge, but requests are sent through Riverpod's
`apiProvider.notifier`.

```dart
ApiClient.instance(
  baseUrl: AppEnv.apiBaseUrl,
);
```

Use the generated SDK from a Riverpod `WidgetRef`:

```dart
final riderescueApi = RiderescueApi.fromRef(ref);

await riderescueApi.v1.auth.login(body: body);
```

The generated endpoint classes should contain versionless SDK paths such as:

```dart
String get login => '/auth/login';
```

Generated feature requests pass the version separately:

```dart
return ref.read(apiProvider.notifier).send(
  PostRequest<AuthSessionOk>(
    endpoint: const V1Routes().auth.login,
    version: 'v1',
    options: options,
    body: body.toJson(),
    fromJson: (json) => AuthSessionOk.fromJson(
      Map<String, dynamic>.from((json as Map?) ?? {}),
    ),
  ),
);
```

That keeps the split clear:

```text
baseUrl:       https://port-5000.alidantech.org
version:       v1
endpoint path: /auth/login
final URL:     https://port-5000.alidantech.org/v1/auth/login
```

The SDK must not create hidden global clients, read `.env`, hardcode `baseUrl`,
or call `ApiClient.send`.

Root `RiderescueApi` only owns version facades. Version-specific features live
under the version client:

```dart
final riderescueApi = RiderescueApi.fromRef(ref);

await riderescueApi.v1.auth.login(body: body);
await riderescueApi.v1.users.getCurrentUser();
```

Resources with no operations are not emitted as features or endpoint groups. For
example, a shared schema-only resource should not generate `SharedFeature`,
`shared = SharedFeature(ref)`, or `shared_endpoints.dart`.

## Bridge Compatibility

The generated SDK declares these as normal dependencies:

```yaml
flutter_api_bridge: ^0.1.0
flutter_riverpod: ^2.6.1
```

Do not use `peer_dependencies`; Dart pub resolves one compatible version for the
whole app/package graph.

Keep the Flutter app on compatible ranges:

```yaml
dependencies:
  flutter_api_bridge: ^0.1.0
  flutter_riverpod: ^2.6.1
  riderescue_api:
    path: ../sdk/packages/riderescue_api
```

After generation, verify the resolved version from the app:

```bash
flutter pub get
flutter pub deps | grep flutter_api_bridge
flutter pub deps | grep flutter_riverpod
```

If there is a version conflict, align the app and SDK to the same compatible
dependency ranges.
