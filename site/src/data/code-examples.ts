import type { CodeExample } from "./types";

export const ENTITY_CODE: CodeExample = {
  filename: "user.entity.config.ts",
  language: "typescript",
  code: `export default class UserEntityConfig extends EntityConfigBase {
  key = "user";
  
  fields = this.defineFields({
    email: stringField({ length: 255 }),
    status: enumField(["active", "suspended"]),
  });
}`,
};

export const TEMPLATE_CODE: CodeExample = {
  filename: "dto.create.hbs",
  language: "handlebars",
  code: `export class Create{{entity.pascal_case_key}}Dto {
{{#each entity.fields}}
  {{name.casing.snake}}!: {{typescript_type}};
{{/each}}
}`,
};

export const OUTPUT_CODE: CodeExample = {
  filename: "create-user.dto.ts",
  language: "typescript",
  code: `export class CreateUserDto {
  email!: string;
  status!: UserStatus;
}`,
};
