import { OpenApiVersion } from "../targets/openapi/options/openapi-version";
import { OpenApiServer } from "../targets/openapi/options/openapi.types";


export interface CompileOptions {
  readonly openapi?: OpenApiVersion;
  readonly validate?: boolean;
  readonly servers?: readonly OpenApiServer[];
}
