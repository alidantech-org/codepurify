// //////////////////////////////////////////////////////////////////////////////
//  IMPORTS
// //////////////////////////////////////////////////////////////////////////////

// shared types
import * as B from '../../../shared/base';

// enums
import * as PlatformEnums from '../../../enums/platform';

// relations
import * as App from '../app/app.types';

// //////////////////////////////////////////////////////////////////////////////
//  CORE INTERFACE
// //////////////////////////////////////////////////////////////////////////////

export interface IAppApiKey extends B.IBase {
  /*-------- Basic Info -------------*/
  appId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;

  /*-------- Flags ------------------*/
  isActive: boolean;

  /*-------- Enums ------------------*/
  status: PlatformEnums.EApiKeyStatus;

  /*-------- Dates -----------------*/
  expiresAt?: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;

  /*-------- Relations -------------*/
  readonly app?: App.IApp;
}

// //////////////////////////////////////////////////////////////////////////////
//  ROOT KEYS
// //////////////////////////////////////////////////////////////////////////////

export type AppApiKeyKey = keyof IAppApiKey;
