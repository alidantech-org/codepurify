---
title: Diagnostics
description: Real-time error detection and validation
---

# Diagnostics

The extension provides real-time error detection for template syntax and context.

## Error Types

### Invalid Context Paths

❌ Invalid:

```
{! entity.names.casings.camel !}
```

✅ Valid:

```
{! entity.names.casing.camel !}
```

### Unknown Variables

❌ Invalid:

```
{! entity.unknown_property !}
```

✅ Valid:

```
{! entity.names.original !}
```

### Syntax Errors

❌ Invalid:

```
{!#if condition!} // content {!#if!} // Missing closing tag
```

✅ Valid:

```
{!#if condition!} // content {!/if!}
```

## Error Display

Errors appear as:

- **Red underline** - Syntax errors
- **Yellow underline** - Warnings
- **Hover tooltip** - Error description

<!-- screenshot: Red underline under invalid syntax -->

## Real-Time Validation

Errors are detected as you type:

```
{! entity. !} // No error
{! entity.names. !} // No error
{! entity.names.casings.camel !} // Error: "casings" not found
```

## Common Validation Rules

### Casing Properties

Must use `casing` (not `casings` or `case`):

```
{! entity.names.casing.camel !} // ✅ Valid
{! entity.names.casings.camel !} // ❌ Invalid
{! entity.names.case.camel !} // ❌ Invalid
```

### Array Access

Must use proper array structure:

```
{! entity.fields.arrays.all.items !} // ✅ Valid
{! entity.fields.items !} // ❌ Invalid
```

### Control Flow Tags

Must have proper opening/closing tags:

```
{!#if condition!} {!/if!} // ✅ Valid
{!#if condition!} {!#if!} // ❌ Invalid (missing closing)
```

## Error Messages

Hover over errors to see detailed messages:

- `"casings" is not a valid property of "entity.names"`
- `Missing closing tag for "if"`
- `Unknown variable "unknown_property"`

## Performance

Validation runs in the background without affecting typing performance. Large files are processed incrementally.
