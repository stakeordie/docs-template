# Markdown Guide

## Basic Syntax

```markdown
# Heading 1
## Heading 2

**Bold text**
*Italic text*

- List item 1
- List item 2

1. Numbered item 1
2. Numbered item 2

[Link text](url)
```

## Code Blocks

```typescript
interface Config {
  title: string;
  description: string;
}
```

## Mermaid Diagrams

Create diagrams using Mermaid syntax:

\```mermaid
sequenceDiagram
    Alice->>John: Hello John
    John-->>Alice: Hi Alice
\```

## Custom Containers

::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::
