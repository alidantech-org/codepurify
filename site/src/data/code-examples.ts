import type { CodeExample } from "./types";

export const ENTITY_CODE: CodeExample = {
  filename: "user.entity.config.ts",
  language: "typescript",
  code: `import {
  EntityConfigBase,
  stringField,
  enumField,
  query,
  mutation,
  transition,
} from "@codepurify/core";

export default class UserEntityConfig
  extends EntityConfigBase {
  key = "user";

  fields = this.defineFields({
    email: stringField({
      length: 255,
      query: query()
        .select()
        .defaultSelect()
        .search()
        .sort()
        .build(),
      mutation: mutation()
        .apiWritable()
        .build(),
    }),

    status: enumField(
      ["active", "suspended", "deleted"] as const,
      { default: "active" }
    ),
  });

  transitions = [
    transition({
      field: () => this.fields.status,
      initial: this.fields.status.values.active,
      terminal: [this.fields.status.values.deleted],
      transitions: {
        active: ["suspended", "deleted"],
        suspended: ["active", "deleted"],
        deleted: [],
      },
    }),
  ];

  templates = [
    "dto.create",
    "dto.update",
    "typeorm.entity",
    "schema.zod",
  ] as const;
}`,
};

export const TEMPLATE_CODE: CodeExample = {
  filename: "dto.create.hbs",
  language: "handlebars",
  code: `export class Create{{entity.pascal_case_key}}Dto {
{{#each entity.fields.mutation.api_create}}
  {{snake_case_key}}!: {{typescript_type}};
{{/each}}
}`,
};

export const OUTPUT_CODE: CodeExample = {
  filename: "create-user.dto.ts  —  generated",
  language: "typescript",
  code: `export class CreateUserDto {
  email!: string;
  status!: UserStatus;
}`,
};
