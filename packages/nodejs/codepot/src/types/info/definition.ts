import { DefinitionItem } from '../definition';

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

export interface InfoDefinition extends DefinitionItem {
  title: string;

  version: string;

  termsOfService?: string;

  contact?: ContactDefinition;

  license?: LicenseDefinition;
}
