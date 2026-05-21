export const SchemaAccess = {
  public: "public",
  auth: "auth",
  private: "private",
  secret: "secret",
  internal: "internal",
  system: "system",
} as const;

export type SchemaAccess = (typeof SchemaAccess)[keyof typeof SchemaAccess];

export function isHiddenByDefault(access?: SchemaAccess): boolean {
  return (
    access === SchemaAccess.secret ||
    access === SchemaAccess.internal ||
    access === SchemaAccess.system
  );
}
