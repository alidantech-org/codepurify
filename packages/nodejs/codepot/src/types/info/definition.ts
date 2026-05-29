export interface ContactDefinition {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseDefinition {
  name: string;
  identifier?: string;
  url?: string;
}

export interface InfoDefinition {
  title: string;

  version: string;

  description?: string;

  termsOfService?: string;

  contact?: ContactDefinition;

  license?: LicenseDefinition;
}
