/**
 * @file app.types.ts
 * @description Types for the App entity
 */

// shared types
import * as B from '../../../shared/base';
import * as C from '../../../shared/config';

// enums
import * as PlatformEnums from '../../../enums/platform';

// relations
import * as ApiKey from '../app-api-key';
import * as Domain from '../app-domain';
import * as User from '../../auth/user';

// //////////////////////////////////////////////////////////////////////////////
//  CORE INTERFACE
// //////////////////////////////////////////////////////////////////////////////

export interface IApp extends B.IBase {
  /*-------- Basic Info -------------*/
  name: string;
  slug: string;
  description: string | null;

  /*-------- Flags ------------------*/
  isInternal: boolean;
  isActive: boolean;

  /*-------- Enums ------------------*/
  appType: PlatformEnums.EAppType;
  status: PlatformEnums.EAppStatus;

  /*-------- Foreign Keys ----------*/
  ownerId: string | null;

  /*-------- Relations -------------*/
  readonly apiKeys?: ApiKey.IAppApiKey[];
  readonly domains?: Domain.IAppDomain[];
  readonly owner?: User.IUser;
}
