The core problem: JSX uses {expression} and {...props}. Handlebars uses {{expression}}. Both use curly braces. When you write a Handlebars template that generates JSX, every JSX brace is a potential conflict.
What you want to generate
Target output (.tsx)
This is a real generated React component. Every {curly} here is JSX — it should appear literally in the output file, not be consumed by Handlebars.
// Generated output you want:
export function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {user.isAdmin && <AdminBadge />}
    </div>
  );
}
The naive template (broken)
Will not work
Handlebars sees every {{ and tries to evaluate it. The JSX curly braces get consumed or cause parse errors.
{{! BROKEN - Handlebars consumes JSX braces }}
export function {{entity.names.casing.pascal}}Card(
  { {{entity.names.casing.camel}} }: Props
) {
  return (
    <div>
      <h1>{ {{entity.names.casing.camel}}.name}</h1>
    </div>
  );
}
Handlebars sees { {{entity and either throws a parse error or produces garbage output. Single JSX braces are fine — only double-brace collisions cause issues.
Single JSX braces — actually fine
No collision
Single curly braces in JSX don't conflict with Handlebars. Only {{ double braces }} are Handlebars expressions. Single braces pass through untouched.
{{! This part is fine — single JSX braces }}
<h1>{user.name}</h1>
<p>{user.email}</p>

{{! This part conflicts — double braces }}
<h1>{{entity.names.casing.camel}}.name}</h1>
       ^^^ Handlebars eats this

Good question — React templates are a meaningful special case because JSX is not plain text. Let me search for what actually works well here.Good, I have what I need. The core problem is well-documented — JSX and Handlebars share `{}` syntax and that collision is the central challenge to design around.The core insight is this: **JSX single braces `{x}` don't conflict with Handlebars at all** — only double braces `{{x}}` do. So the actual collision surface is much smaller than it first seems.

The practical solution that scales cleanest for Codepurify is the **`jsx.*` context namespace**. Your context builder constructs JSX expression strings in TypeScript (where you have full language power), then the template outputs them with triple-stash. The template never needs to construct a JSX expression itself.

The architectural implication worth thinking about now: your `template.target` field (or equivalent) should tell the context builder what to include. A Python template and a React template rendering the same entity need very different context. The core fields/flags/names context stays shared — only the `jsx.*` layer is additive for React. That's the cleanest way to avoid DSL explosion while still supporting multiple targets from one entity config.

One strong recommendation: **disable HTML escaping globally** (`noEscape: true`) for your rendering engine. You're generating source code, never HTML. Escaping will silently corrupt angle brackets in TypeScript generics, JSX tags, and comparison operators. It's a constant footgun if you leave it on.


The root question: does the generated file's syntax use {{ }} double curly braces? If yes — conflict. If no — clear. Everything flows from that.
Python (.py)
No conflict
SQL (.sql)
No conflict
Java / Kotlin
No conflict
Rust (.rs)
No conflict
C# (.cs)
No conflict
Ruby (.rb)
No conflict
PHP classes
No conflict
OpenAPI YAML
No conflict
TypeScript / JS
Template literals only
JSX / TSX (React)
Single braces only
Rust format strings
Single braces inside strings
PHP Blade / Twig
If generating templates
Go templates / Helm
Identical syntax — severe
Angular templates
Identical syntax — severe
Django / Jinja2 templates
Same {{ }} pattern — severe
Vue templates
Identical syntax — severe
The pattern: generating code files (classes, functions, structs) is almost always safe. Generating template files (things that themselves use {{ }}) is where conflicts live.

Good question — let me think through this systematically across all the common targets Codepurify might generate for.Good, I have a complete picture now. Let me map this out properly across every language and stack Codepurify might target.The most important design insight this surfaces for Codepurify:

**The real dividing line isn't language — it's "code file vs template file."** Generating a Go struct, an Angular service class, a Vue composable — all clean. Generating a Go template, an Angular HTML template, a Vue `<template>` section — severe conflict. The same language stack can appear on both sides of that line depending on what you're generating.

This suggests a meaningful addition to your template registration config: a `generates` field distinguishing `source_file` from `template_file`. The engine can then automatically apply the right escaping strategy — raw blocks and pre-built strings for template targets, clean passthrough for source targets.

The other practical conclusion: **Go templates and Helm charts are probably the worst targets to support with Handlebars.** The syntaxes are nearly identical. If Codepurify ever needs to generate Helm charts or Go `text/template` files, that specific target type deserves its own renderer rather than contorting Handlebars around it. Everything else on the severe list (Angular, Vue, Django) at least has a workable raw block strategy.

The key property: Codepurify's context schema is fully known at compile time. Every valid path — entity.names.casing.pascal, field.flags.is_string — is registered before any template is parsed. This means you can classify every {{ }} token as either yours or the user's.


Normal Handlebars — blind to context
Current situation
Handlebars sees all {{ }} tokens as expressions to evaluate. It has no way to know which are Codepurify variables vs which should be passed through as literal text in the output.
// Template author writing a Vue template generator:
<div>{{ entity.names.casing.pascal }}</div>   ← yours
<p>{{ user.name }}</p>                         ← user's (Vue binding)

// Handlebars: tries to evaluate BOTH
// Result: "user.name" consumed, rendered as empty string
// Vue binding disappears silently from generated file
Custom compiler — context-aware
Your idea
Before rendering, you know every valid Codepurify path. The custom compiler checks each {{ }} token against the registered context schema. If it matches — evaluate it. If it doesn't match — treat it as a literal passthrough string.
// Template author writes:
<div>{{ entity.names.casing.pascal }}</div>   ← in schema → evaluate
<p>{{ user.name }}</p>                         ← NOT in schema → passthrough

// Custom compiler output:
<div>User</div>                                ← resolved from context
<p>{{ user.name }}</p>                         ← literal in generated file ✓
This is what makes the idea clean: no escape syntax needed, no raw blocks, no pre-built strings. Template authors just write what they mean. The compiler knows the difference.
The property that makes it possible
Closed context set
Most template engines can't do this because they don't know the context schema upfront. Codepurify can because its context is registered, not dynamic. You can build a complete set of valid paths before any template runs.
// At engine startup — build the known path set:
const knownPaths = new Set([
  'entity.names.casing.pascal',
  'entity.names.casing.camel',
  'entity.names.casing.snake',
  'entity.fields.arrays.all.items',
  'entity.fields.flags.has_string',
  'field.flags.is_string',
  'field.flags.is_nullable',
  'global.templates.current.name',
  // ... all registered context paths
]);

// During compilation — classify each token:
function isCodepurifyPath(pathParts) {
  const path = pathParts.join('.');
  return knownPaths.has(path) || matchesArrayItemScope(path);
}