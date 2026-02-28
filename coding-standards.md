# Coding Standards

This document defines mandatory coding conventions for all JavaScript /
TypeScript code. The objective is deterministic, readable,
production-grade output with minimal stylistic entropy.

------------------------------------------------------------------------

# 1. Variable Declarations

## 1.1 Never Use `var`

`var` is forbidden.

**Reason:**\
Function scoping, hoisting behavior, and redeclaration permissiveness
introduce ambiguity and bugs.

### ✅ Correct

``` js
const MAX_RETRIES = 3
let retryCount = 0
```

### ❌ Incorrect

``` js
var retryCount = 0
```

------------------------------------------------------------------------

## 1.2 Prefer `const` by Default

All variables must be declared with `const` unless mutation is
explicitly required.

### Decision Rule

-   Use `const` for values that do not change.
-   Use `let` only when reassignment is required.

------------------------------------------------------------------------

# 2. Functions

## 2.1 Use Arrow Functions

All non-class functions must use arrow function syntax.

### ✅ Correct

``` js
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### ❌ Incorrect

``` js
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

const calculateTotal = function(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

------------------------------------------------------------------------

## 2.2 Explicit Returns

Avoid implicit returns for multi-line logic.\
Use braces and explicit `return`.

------------------------------------------------------------------------

# 3. Comments

## 3.1 Comments Must Start with Uppercase

All comments must begin with a capital letter.

### ✅ Correct

``` js
// Validate input before processing
const process = (data) => {}
```

### ❌ Incorrect

``` js
// validate input before processing
```

## 3.2 Comments Must Explain Why, Not What

Avoid narrating obvious code behavior.

------------------------------------------------------------------------

# 4. Naming Conventions

## 4.1 Variables and Functions

Use `camelCase`.

## 4.2 Constants

Use `UPPER_SNAKE_CASE` for configuration constants.

## 4.3 Booleans Must Sound Boolean

Prefix with: - `is` - `has` - `can` - `should`

------------------------------------------------------------------------

# 5. Control Flow

## 5.1 Always Use Strict Equality

`===` and `!==` are mandatory.

## 5.2 Guard Clauses Over Nested Conditionals

Minimize indentation depth.

------------------------------------------------------------------------

# 6. Immutability First

Avoid mutating input parameters.

------------------------------------------------------------------------

# 7. Error Handling

Always handle errors explicitly.\
Never swallow exceptions.

------------------------------------------------------------------------

# 8. Formatting Rules

-   Use 2 spaces indentation
-   No semicolons
-   One blank line between logical blocks
-   Max line length: 100 characters
-   Trailing commas in multi-line objects and arrays

------------------------------------------------------------------------

# 9. Async Patterns

Prefer `async/await` over `.then()`.

------------------------------------------------------------------------

# 10. Deterministic Code Rule

Code must be: - Predictable - Pure when possible - Side-effect
isolated - Easy to test

------------------------------------------------------------------------

# 11. LLM Enforcement Directive

When generating code:

1.  Never output `var`
2.  Always prefer `const`
3.  Always use arrow functions
4.  Always start comments with uppercase
5.  Use strict equality
6.  Prefer guard clauses
7.  Avoid nested logic when possible
8.  Avoid mutation of inputs

Violation of these rules should be treated as incorrect output.
