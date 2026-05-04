````md
# Codepurify Architecture Overview (Current Design)

## Core Philosophy

Codepurify is NOT primarily:
- a CRUD generator
- an AI code writer
- a framework

Codepurify is:

```txt
A deterministic architecture rendering engine.
````

The idea:

```txt
Human or AI defines intent/config.
Codepurify generates architecture consistently.
```

The engine:

* builds structured context objects
* validates template variables
* renders user-owned templates
* generates deterministic codebases

The goal is:

* reduce duplication
* reduce AI token waste
* preserve architecture consistency
* make AI-assisted coding deterministic
* allow scalable generation across many languages/frameworks

---

# High-Level Pipeline

```txt
raw config
→ normalization
→ rules/context expansion
→ context building
→ validation
→ template rendering
→ generated files
```

Templates should mostly:

* render

The engine/rules should:

* think

---

# Main Philosophy Rules

## 1. Templates are language-specific

Codepurify context is language-neutral.

BAD:

```txt
field.types.ts
field.types.python
```

GOOD:

```txt
field.flags.is_string
field.flags.is_boolean
field.flags.is_enum
```

Templates decide:

* how a language expresses those kinds

Example:

```hbs
{{#if flags.is_string}}string{{/if}}
{{#if flags.is_boolean}}boolean{{/if}}
```

---

## 2. Context is deterministic

Templates only use:

* promised variables
* stable paths
* validated structures

---

## 3. Templates are user-owned

Users own:

* templates
* conventions
* architecture style

Codepurify owns:

* context runtime
* rendering pipeline
* validation
* deterministic generation

---

## 4. AI is optional

Core generation works WITHOUT AI.

AI is only an enhancement layer for:

* generating configs
* generating templates
* extracting templates from code
* assisting users

---

# Root Context Structure

```ts
type TemplateContextRoot = {
  global: GlobalContext;

  entity: EntityContext;

  resource: ResourceContext;
};
```

NOTE:

* `resource` is reserved for future API/resources concepts
* NOT template files

---

# Global Context

```ts
type GlobalContext = {
  arrays: ...;
  names: ...;

  templates: TemplatesContext;
};
```

---

# Templates Context

Purpose:

* registry of all loaded templates
* current rendering template
* template metadata
* cross-template access

Structure:

```ts
global.templates.current

global.templates.all.by_name.<template_name>

global.templates.all.arrays.items
global.templates.all.arrays.length
```

Example:

```hbs
{{global.templates.current.name}}

{{global.templates.all.by_name.base_dto.output.path_pattern}}
```

Dynamic template names are allowed ONLY under:

```txt
global.templates.all.by_name.<template_name>
```

Validation ensures template exists.

---

# Current Template Config Shape

```ts
export interface CodepurifyTemplateRegistration {
  name: string;

  templatePath: string;

  outputFolder: CodepurifyOutputFolder;

  fileName: CodepurifyOutputFileName;

  description?: string;

  type: 'entity' | 'resource';
}
```

Resolved version:

```ts
export interface ResolvedCodepurifyTemplateRegistration
  extends CodepurifyTemplateRegistration {

  absoluteTemplatePath: string;

  resolvedOutputFolderPattern: string;

  resolvedFileNamePattern: string;

  resolvedOutputPathPattern: string;
}
```

---

# Context Folder Structure

```txt
src/context/
  global/
    arrays/
    names/

  entity/

  resource/
```

Future recommended structure:

```txt
src/context/
  global/
    arrays/
      type.ts
      create.ts
      example.ts

    casing/
      type.ts
      create.ts
      example.ts

    names/
      type.ts
      create.ts
      example.ts

  entity/
    field/
    relation/
    index/

  resource/
```

---

# Context Design Principles

## Consistent Paths

Context should be predictable.

Examples:

```txt
arrays.*.items
arrays.*.length
items[].index
```

---

# Arrays Context Rules

ALL array collections follow:

```ts
{
  length: number;

  items: [
    {
      index: number;
    }
  ];
}
```

---

# Core Array Types

```ts
export type ArrayItemContext<TPayload extends object = object> = {
  index: number;
} & TPayload;

export type ArrayChildContext<TItem extends object = object> = {
  length: number;

  items: ArrayItemContext<TItem>[];
};
```

---

# Names Context

## Important Rules

### ONLY ONE `original`

```txt
names.original
```

exists once only.

NO:

* casing.original
* plural.original
* singular.original

because it becomes confusing.

---

## Only `.casing.*` are strings

Everything else is structured.

---

## Final Names Context

```ts
type NamesContext = {
  original: string;

  length: number;

  casing: CasingContext;

  arrays: {
    parts: ArrayChildContext<NameUnitContext>;

    words: ArrayChildContext<NameUnitContext>;

    characters: ArrayChildContext<NameUnitContext>;
  };

  singular: {
    casing: CasingContext;

    arrays: NameArraysContext;
  };

  plural: {
    casing: CasingContext;

    arrays: NameArraysContext;
  };
};
```

---

# Casing Context

```ts
type CasingContext = {
  camel: string;
  pascal: string;
  snake: string;
  kebab: string;
  dot: string;
  slash: string;
  path: string;
  constant: string;
  lower: string;
  upper: string;
  title: string;
  train: string;
};
```

---

# Name Unit Context

Each array item under names contains casing only.

Example:

```ts
{
  index: 0,

  casing: {
    camel: "owner",
    pascal: "Owner",
    snake: "owner",
  }
}
```

---

# Entity Context Philosophy

Entity context exposes:

* fields
* relations
* indexes
* transitions
* checks

using:

* arrays
* flags
* counts

---

# Field Context Philosophy

Language-neutral.

BAD:

```txt
field.types.ts
```

GOOD:

```txt
field.flags.is_string
field.flags.is_enum
field.flags.is_boolean
```

And grouped collections:

```txt
entity.fields.arrays.by_kind.string.items
entity.fields.arrays.by_kind.enum.items
```

---

# Two Supported Template Styles

## 1. Grouped Loops

```hbs
{{#each entity.fields.arrays.by_kind.string.items}}
  {{names.casing.camel}}: string;
{{/each}}
```

---

## 2. Unified Loop + Flags

```hbs
{{#each entity.fields.arrays.all.items}}
  {{#if flags.is_string}}
    {{names.casing.camel}}: string;
  {{/if}}
{{/each}}
```

Both styles are valid.

---

# Imports Strategy (MVP)

For MVP:

* imports can be hardcoded in templates

Example:

```hbs
{{#if entity.fields.flags.has_string}}
import { IsString } from "class-validator";
{{/if}}
```

No advanced import engine required initially.

---

# Handlebars Choice

Handlebars was chosen because:

* simple
* readable
* logic-light
* deterministic
* cross-language friendly

Compared to:

* Jinja2 (too powerful/logic-heavy)
* Eta/EJS (too JS-like)

Philosophy:

```txt
Templates render.
Engine computes.
```

---

# AI Vision

Future idea:

```txt
AI generates:
- configs
- templates
- architecture intent

Codepurify generates:
- final deterministic codebase
```

This reduces:

* token usage
* hallucinations
* architecture drift
* repeated boilerplate generation

---

# Template Extraction Idea

Future feature:

```txt
Give Codepurify AI:
- 1-4 existing files

AI:
- extracts reusable template
- replaces entity-specific parts with context variables
- creates locked .hbs template
```

Example:

```txt
user.entity.ts
→ entity.hbs
```

---

# Template Validation Idea

Handlebars AST parsing can extract:

* used variables
* paths
* loop scopes

Codepurify can validate:

```txt
unknown variable:
entity.names.casings.camel
```

before rendering.

---

# Final Core Philosophy

```txt
AI should generate intent.
Codepurify should generate architecture.
```

OR:

```txt
structured deterministic systems amplifying probabilistic AI.
```

```
```
````md id="5i6x8o"
# Additional Design Notes (Continuation)

---

# Template Philosophy

Templates are:
- user-visible
- user-owned
- editable
- deterministic

Generated output should always feel:
- normal
- readable
- maintainable
- human-owned

Codepurify should NEVER generate:
- magical unreadable code
- opaque runtime abstractions
- hidden framework logic

---

# Why Templates Matter

Templates are effectively:

```txt id="9phn6w"
architecture rendering programs
````

The context runtime is the API they program against.

This means:

* variable naming consistency matters heavily
* path predictability matters heavily
* context stability matters heavily

---

# Context Contract Philosophy

Users should not memorize random variables.

They should infer paths naturally.

Example:

```txt id="xksn7e"
arrays.*.items
arrays.*.length
```

becomes predictable everywhere.

Similarly:

```txt id="kw5w0k"
*.flags.*
*.counts.*
*.casing.*
```

should always mean the same thing.

---

# Planned Context Conventions

## Arrays

ALL iterable collections:

```txt id="q8z8jx"
*.arrays.<name>.items
*.arrays.<name>.length
```

Example:

```txt id="vf4t0l"
entity.fields.arrays.all.items
entity.fields.arrays.by_kind.string.items
global.templates.all.arrays.items
```

---

## Items

ALL array items:

```txt id="38d6c7"
items[].index
```

always exists.

---

## Flags

ALL booleans grouped under:

```txt id="mfv97s"
flags.*
```

Examples:

```txt id="f5ccs0"
field.flags.is_string
field.flags.is_enum
field.flags.is_nullable

entity.fields.flags.has_string
entity.fields.flags.has_enum
```

---

## Counts

Numeric summaries grouped under:

```txt id="6e2jpv"
counts.*
```

Examples:

```txt id="kr5d35"
entity.fields.counts.all
entity.fields.counts.required
```

---

## Maps

Direct lookup objects grouped under:

```txt id="k6r6si"
maps.*
```

Example:

```txt id="b9f45x"
global.templates.all.by_name.base_dto
```

Maps are allowed ONLY in controlled deterministic namespaces.

The system generally prefers:

* iterable arrays
* deterministic structures

over arbitrary user-defined property access.

---

# Why Arbitrary Access Is Restricted

BAD:

```hbs id="l8w3m2"
{{entity.fields.email}}
```

because:

* email may not exist
* templates become non-portable

GOOD:

```hbs id="l0x55x"
{{#each entity.fields.arrays.all.items}}
```

because:

* works for all entities
* deterministic
* reusable

---

# Static vs Dynamic Context

Most context is:

* static
* promised
* deterministic

BUT some controlled dynamic access is allowed.

Example:

```txt id="9ozu9q"
global.templates.all.by_name.<template_name>
```

This is safe because:

* template names are registered at runtime
* validator can confirm existence

---

# Validation Philosophy

Codepurify should validate:

* template variables
* template references
* context paths
* unknown properties
* invalid loops

before rendering.

Goal:

```txt id="3w6g3m"
fail early with clear errors
```

Example:

```txt id="7fh8db"
Unknown variable:
entity.names.casings.camel

Did you mean:
entity.names.casing.camel
```

---

# Handlebars AST Parsing

Planned feature:

```txt id="s3j7zj"
parse .hbs templates
→ extract variable paths
→ validate against context contract
```

Possible commands:

```bash id="a2b3lg"
codepurify inspect-template
```

and:

```bash id="x0n0xh"
codepurify context-vars
```

---

# Rule Engine Philosophy

Rules execute BEFORE rendering.

Templates should NOT compute architecture logic.

BAD:

```hbs id="y9l0s7"
{{#if (eq field.kind "string")}}
```

everywhere.

BETTER:

```txt id="3znn22"
field.flags.is_string
```

already computed by engine.

---

# Future Rule Possibilities

Rules may later compute:

* imports
* validation decorators
* db mappings
* path generation
* relationship metadata
* query capabilities
* form capabilities

But MVP should stay minimal.

---

# MVP Philosophy

Current recommendation:

```txt id="o5f7nq"
simple deterministic generator first
```

NOT:

* plugin systems
* AI copilots
* marketplaces
* cloud platform
* giant meta-framework

The MVP should only prove:

```txt id="e7l4ye"
config
→ context
→ template
→ generated code
```

reliably.

---

# Economic Vision

Potential long-term value:

```txt id="6p6m0k"
AI-efficient architecture generation
```

instead of:

* raw AI code generation

The idea:

* AI generates intent/config
* Codepurify renders architecture deterministically

This potentially reduces:

* token usage
* hallucination
* repetitive prompts
* architecture drift

---

# Long-Term Strategic Position

Potential positioning:

```txt id="z6m5p8"
deterministic software architecture synthesis
```

or:

```txt id="2h9w1m"
AI-native architecture rendering engine
```

---

# Important Warning

The biggest risk is:

```txt id="k5z2os"
DSL/context explosion
```

Too many:

* variables
* paths
* abstractions
* nested structures

can make system unusable.

Therefore:

* consistency > cleverness
* predictability > flexibility
* stable paths > magical shortcuts

---

# Current Design Philosophy Summary

```txt id="v7q8or"
minimal config
+
rich deterministic context
+
simple readable templates
+
validated rendering
+
AI optional
```

This is the current core architecture direction.

```
```
````md id="v1o9q4"
# Future Architecture Ideas (Continuation)

---

# AI + Codepurify Relationship

Codepurify is NOT intended to replace developers.

The intended model:

```txt id="g6n9r5"
Human:
- defines architecture
- defines intent
- defines business logic

AI:
- assists
- expands intent
- creates configs/templates

Codepurify:
- guarantees deterministic generation
````

---

# Why This Matters

Current AI coding problems:

* token exhaustion
* inconsistent conventions
* architecture drift
* repeated prompts
* duplicated boilerplate generation

Developers repeatedly say things like:

```txt id="m9r4n7"
“Follow the exact same DTO pattern.”
```

Codepurify aims to encode those conventions once.

---

# AI Compression Idea

Traditional AI coding:

```txt id="c8x2t1"
AI repeatedly writes entire files
```

Codepurify vision:

```txt id="s7m1f9"
AI generates small declarative intent
→ deterministic engine generates full architecture
```

Example:

```txt id="d5n0z4"
5 lines of config
→ 50 coherent files
```

This is:

* cheaper
* faster
* more stable
* more maintainable

---

# Core Insight

```txt id="o1k6v3"
AI should not repeatedly invent architecture.
```

Architecture should already exist as:

* templates
* context contracts
* rendering rules
* deterministic systems

---

# Future AI Features

Potential future features:

## 1. Config generation

User says:

```txt id="j8f5s0"
Create Driver entity
```

AI generates:

* fields
* relations
* indexes
* transitions

---

## 2. Template extraction

User provides:

* 1-4 real files

AI:

* detects patterns
* replaces dynamic sections with variables
* creates locked reusable template

---

## 3. Template assistance

AI helps:

* create templates
* explain variables
* fix template errors
* suggest improvements

---

## 4. Architecture packs

AI could assemble:

* template collections
* conventions
* framework packs

---

# Very Important Architectural Principle

AI should NOT be:

* the rendering engine
* the deterministic layer
* the architecture source of truth

AI should be:

* assistant layer
* intent layer
* productivity enhancer

Codepurify itself should remain:

* deterministic
* testable
* explainable
* reproducible

---

# Why Handlebars Was Chosen

Handlebars was selected because:

* simple mental model
* low logic
* readable syntax
* framework/language neutral
* easy to validate
* deterministic

Philosophy:

```txt id="r2j5x1"
Templates display.
Context computes.
```

This matches Codepurify architecture strongly.

---

# Why Jinja2 Felt Hard

Jinja2 behaves more like:

* embedded programming language

It allows:

* mutations
* expressions
* heavy conditions
* logic inside templates

This makes:

* templates harder to reason about
* generation harder to validate
* debugging more difficult

Codepurify intentionally prefers:

* strong engine
* simple templates

instead of:

* weak engine
* very smart templates

---

# Cross-Language Rendering Philosophy

Templates are language-specific.

Context is language-neutral.

GOOD:

```txt id="u8k9f6"
field.flags.is_string
field.flags.is_boolean
field.flags.is_enum
```

BAD:

```txt id="v1p7g2"
field.types.ts
field.types.python
```

Templates decide:

* how a target language expresses concepts

---

# Example Philosophy

Same entity config:

```txt id="s5m2j4"
User:
- email
- password
- is_active
```

can generate:

* TypeScript
* Go
* Python
* Java
* Rust
* SQL
* OpenAPI

using different templates.

---

# Current Context Namespace Philosophy

Namespaces should communicate behavior.

Examples:

```txt id="q6f9e2"
arrays.*   → iterable collections
flags.*    → booleans
counts.*   → numbers
casing.*   → formatted strings
maps.*     → lookup objects
```

This improves:

* discoverability
* autocomplete
* readability
* documentation
* validation

---

# Important Naming Philosophy

Snake case is preferred for:

* context paths
* predictable validation
* reduced ambiguity
* cross-language consistency

Examples:

```txt id="p8n5r0"
entity.fields.arrays.by_kind.string.items
entity.fields.flags.has_string
global.templates.current
```

NOT camelCase paths.

---

# Long-Term Tooling Ideas

Potential tooling:

* VSCode autocomplete
* template variable inspector
* template linter
* context explorer
* template dependency graph
* generation diff viewer

---

# Example Future CLI Commands

```bash id="k3s1m7"
codepurify inspect-template
```

Show:

* variables used
* loops
* unresolved references

---

```bash id="v7q8n1"
codepurify context-vars entity
```

Show:

* available context paths
* types
* descriptions

---

```bash id="u2w5r6"
codepurify ai extract-template
```

Generate template from existing files.

---

# Future Market Position

Possible positioning:

```txt id="n4x8c3"
AI for intent.
Codepurify for execution.
```

OR:

```txt id="b7z1f5"
Stop paying AI to rewrite architecture repeatedly.
```

OR:

```txt id="y3m6k8"
Deterministic generation for AI-native software development.
```

---

# Current MVP Recommendation

DO:

* context runtime
* names context
* arrays context
* entity context
* template rendering
* validation basics

DO NOT:

* overbuild plugins
* build marketplace
* build cloud
* build giant DSL immediately

Focus on:

```txt id="f9j4x0"
one stable deterministic generation pipeline
```

first.

---

# Final Current Philosophy

```txt id="e5r2v9"
Write intent once.
Generate architecture forever.
```

```
```
````md id="x7m2k9"
# Detailed Context & Rendering Philosophy (Continuation)

---

# Context Runtime Philosophy

Codepurify context is essentially:

```txt id="r1w7n5"
a deterministic runtime object model for templates
````

Templates are not supposed to:

* invent structure
* perform architecture logic
* mutate state
* derive complicated metadata

The runtime should already provide:

* organized collections
* flags
* counts
* naming transforms
* classifications

---

# Why This Matters

If templates become too intelligent:

* debugging becomes painful
* templates become non-portable
* AI generation becomes unstable
* onboarding becomes difficult

Codepurify intentionally prefers:

```txt id="p6f8r3"
smart context
+
simple templates
```

instead of:

```txt id="u4m5c1"
simple context
+
smart templates
```

---

# Template Author Experience Goal

Template authors should feel like:

```txt id="a8x3m6"
“I am arranging architecture.”
```

NOT:

```txt id="q9v2n1"
“I am writing a mini programming language.”
```

---

# Example Desired Simplicity

GOOD:

```hbs id="s3k9t8"
{{#each entity.fields.arrays.by_kind.string.items}}
  {{names.casing.camel}}: string;
{{/each}}
```

BAD:

```hbs id="o1m6v7"
{{#each entity.fields.arrays.all.items}}
  {{#if (and (eq kind "string") (not nullable))}}
```

Complex template logic should generally be avoided.

---

# Current Planned Context Categories

Potential future entity context structure:

```txt id="b7n5q2"
entity:
  names
  fields
  relations
  indexes
  checks
  transitions
  permissions
  lifecycle
  database
  forms
  queries
```

Each subcontext follows:

* arrays
* flags
* counts
* maps
* names
* casing

consistently.

---

# Example Future Field Context

```ts id="n5m8r1"
field: {
  key
  kind

  names
  flags
  query
  mutation
  validation

  relation?
  enum?
}
```

---

# Future Field Classification Ideas

Potential grouped arrays:

```txt id="j4r7v9"
entity.fields.arrays.by_kind.string
entity.fields.arrays.by_kind.boolean
entity.fields.arrays.by_kind.enum
entity.fields.arrays.by_kind.number
entity.fields.arrays.by_kind.uuid
entity.fields.arrays.by_kind.foreign
entity.fields.arrays.by_kind.json
entity.fields.arrays.by_kind.object
entity.fields.arrays.by_kind.array
```

---

# Future Query Grouping Ideas

```txt id="f1x5m3"
entity.fields.arrays.by_query.searchable
entity.fields.arrays.by_query.sortable
entity.fields.arrays.by_query.filterable
entity.fields.arrays.by_query.default_select
```

---

# Future Mutation Grouping Ideas

```txt id="u7m4p6"
entity.fields.arrays.by_mutation.create
entity.fields.arrays.by_mutation.update
entity.fields.arrays.by_mutation.system
entity.fields.arrays.by_mutation.api
```

---

# Future Relation Groupings

```txt id="k8t2v5"
entity.relations.arrays.one_to_many
entity.relations.arrays.many_to_one
entity.relations.arrays.many_to_many
entity.relations.arrays.one_to_one
```

---

# Future Index Groupings

```txt id="v9m1r7"
entity.indexes.arrays.unique
entity.indexes.arrays.non_unique
entity.indexes.arrays.composite
```

---

# Why Grouped Arrays Matter

Grouped arrays make templates:

* cleaner
* more readable
* easier to maintain
* easier for AI to generate
* easier to validate

Instead of:

```hbs id="g2m8k4"
{{#if flags.is_string}}
```

everywhere.

---

# But Flags Still Matter

Flags are still useful for:

* mixed rendering
* unified loops
* compact templates

Example:

```hbs id="r6m3v8"
{{#each entity.fields.arrays.all.items}}
```

with:

```txt id="j5n1k7"
flags.is_string
flags.is_enum
flags.is_boolean
```

inside.

Both styles are supported.

---

# Why Codepurify Could Help AI

Current AI coding problems:

* repetitive architecture generation
* token waste
* inconsistent outputs
* lost conventions
* poor large-codebase memory

Codepurify changes the workflow to:

```txt id="c4m9x1"
small declarative intent
→ deterministic architecture synthesis
```

This reduces:

* context requirements
* repeated token usage
* hallucinations
* architectural drift

---

# Intermediate Representation Insight

Codepurify is effectively becoming:

```txt id="n6v2r5"
an intermediate representation for software architecture
```

between:

* human intent
* AI reasoning
* generated code

This is conceptually similar to:

* compiler IR
* AST pipelines
* declarative infrastructure systems

---

# Important Boundary

Codepurify should NOT own:

* business logic
* product decisions
* domain reasoning

It should own:

* deterministic structure
* repeatable architecture
* rendering consistency

---

# Human-Written vs Generated Code

Long-term recommendation:

Generated:

* DTOs
* forms
* schemas
* validators
* repetitive architecture

Human-owned:

* services
* business rules
* workflows
* complex algorithms

This separation keeps generated systems maintainable.

---

# Future Safety Philosophy

Generated files should ideally support:

* regeneration
* diffing
* partial ownership
* stable formatting

Possible future features:

* protected regions
* merge strategies
* file ownership metadata

But NOT necessary for MVP.

---

# Current Biggest Risks

## 1. DSL explosion

Too many:

* paths
* abstractions
* context variants

can make the system unusable.

---

## 2. Over-engineering

The engine can accidentally become:

* giant
* magical
* hard to debug

---

## 3. Weak onboarding

If users cannot understand:

* variables
* templates
* rendering model

adoption will fail.

---

# Current Biggest Strengths

## 1. Strong consistency philosophy

You are aggressively standardizing:

* paths
* arrays
* casing
* flags
* counts

This is GOOD.

---

## 2. Deterministic rendering model

This is excellent for:

* validation
* AI integration
* tooling
* large-scale generation

---

## 3. Language-neutral context

Very important for:

* cross-language reuse
* template portability
* framework flexibility

---

# Current Most Important Goal

The MVP only needs to prove:

```txt id="z5r9m2"
config
→ context
→ template
→ generated output
```

cleanly and predictably.

Nothing more yet.

```
```
````md id="p4m7x2"
# Final Strategic Summary

---

# What Codepurify Is Becoming

Codepurify is evolving toward:

```txt id="k9v4t7"
a deterministic architecture synthesis engine
````

powered by:

* structured configs
* stable context contracts
* user-owned templates
* deterministic rendering

with optional AI assistance layered on top.

---

# The Deep Core Idea

Current AI coding often works like:

```txt id="s5q8n1"
prompt
→ raw file generation
→ repeated prompting
→ drift
→ inconsistency
```

Codepurify aims to change that into:

```txt id="u8m3k5"
intent/config
→ deterministic context
→ stable templates
→ repeatable architecture generation
```

---

# The Most Important Insight

```txt id="j7r2x4"
AI should generate intent.
Deterministic systems should generate architecture.
```

This is the central philosophy behind the project.

---

# Why This Could Matter

Modern AI coding struggles with:

* context exhaustion
* repeated boilerplate generation
* inconsistent architecture
* token inefficiency
* convention drift

Codepurify potentially reduces those problems by:

* locking conventions
* stabilizing architecture
* minimizing repeated reasoning
* compressing software intent into reusable deterministic systems

---

# The Role of Templates

Templates are:

* visible
* editable
* deterministic
* language-specific
* reusable

They are NOT:

* hidden magic
* mini applications
* heavy logic engines

Templates should stay:

* readable
* understandable
* portable

---

# The Role of Context

Context is:

* structured
* deterministic
* validated
* language-neutral

The context runtime should expose:

* classifications
* collections
* flags
* naming transforms
* grouped arrays

so templates remain simple.

---

# The Role of AI

AI is optional.

AI can help:

* generate configs
* create templates
* extract patterns from code
* explain variables
* suggest architectures

But the deterministic engine remains:

* the source of consistency
* the rendering authority
* the stable execution layer

---

# Current Architectural Priorities

Focus ONLY on:

```txt id="n1v6k8"
1. Stable context contracts
2. Predictable paths
3. Deterministic rendering
4. Simple readable templates
5. Clear validation
```

before:

* plugins
* marketplaces
* cloud platforms
* autonomous AI systems

---

# Current MVP Scope

The MVP only needs:

```txt id="q5m2r9"
entity config
→ names context
→ arrays context
→ field context
→ handlebars template
→ generated file
```

That alone already proves the architecture.

---

# Important Design Principles To Preserve

## 1. Predictability > Cleverness

Avoid:

* magical shortcuts
* inconsistent paths
* hidden rules

Prefer:

* explicit structures
* stable namespaces
* repeatable conventions

---

## 2. Structured Namespaces

Examples:

```txt id="r6k1v5"
arrays.*
flags.*
counts.*
casing.*
maps.*
```

should always mean the same thing everywhere.

---

## 3. Templates Render, Engine Computes

Keep:

* business logic
* classification logic
* transformation logic

inside:

* context builders
* rule systems

NOT inside templates.

---

## 4. Human-Owned Output

Generated code should always feel:

* editable
* normal
* readable
* maintainable

Developers should never feel trapped.

---

# Potential Long-Term Vision

Possible future direction:

```txt id="w8m4n7"
small declarative intent
→ deterministic architecture synthesis
→ massive coherent codebases
```

Potentially enabling:

* cheaper AI-assisted development
* architecture consistency at scale
* reusable engineering conventions
* framework/language portability

---

# Final Current Mental Model

```txt id="z2r8m1"
Codepurify is not trying to replace developers.

It is trying to make architecture:
- deterministic
- reusable
- scalable
- AI-efficient
- easier to maintain
```

---

# Final One-Line Summary

```txt id="c9m5v3"
Write intent once.
Generate architecture forever.
```

```
```
