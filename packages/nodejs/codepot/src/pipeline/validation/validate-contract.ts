import { VersionContract } from "@/contract/version/version-contract.types.js";
import { validateVersionContract } from "./validate-version-contract.js";
import {
  invalidResult,
  type ValidationResult,
} from "./validation-result.types.js";

export function validateContract(contract: VersionContract): ValidationResult {
  const issues = validateVersionContract(contract);

  return invalidResult(issues);
}
