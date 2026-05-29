---
name: shadcn-ui
description: Use when adding, updating, or scaffolding a UI component/primitive in this project (button, dialog, card, etc.), or pulling a component from a shadcn-style registry. Covers the shadcn MCP/CLI workflow and this repo's specific conventions (Tailwind v4, import aliases, cn util).
---

# shadcn/ui in this project

## Overview

This is a **Vite + React 19 + TypeScript + Tailwind v4** project that consumes
shadcn-style components via the shadcn CLI (v4) and the connected **shadcn MCP
server**. There is NO `tailwind.config.js` and the `@` alias does NOT point to
`src` — both are easy to get wrong. Follow the conventions below exactly.

## When to use

- Adding a primitive/component (button, dialog, dropdown, card, etc.)
- Browsing or pulling a component from a registry
- Updating an existing `src/components/ui/*` component

## Workflow: MCP first, CLI to install

Two registries are configured (`components.json`): `@shadcn` (official) and
`@react-bits` (`https://reactbits.dev/r/{name}.json`).

1. **Search** — `mcp__shadcn__search_items_in_registries` (query the registry).
2. **Inspect** — `mcp__shadcn__view_items_in_registries` to read source/deps
   before adding. Use `mcp__shadcn__get_item_examples_from_registries` for usage.
3. **Get install command** — `mcp__shadcn__get_add_command_for_items`, then run it.
   It will be `npx shadcn@latest add @shadcn/<name>` (or `@react-bits/<name>`).
4. **Fix imports** (see gotcha below) and run the audit checklist.

CLI fallback without MCP: `npx shadcn@latest add @shadcn/<name>`.

## Project conventions (non-negotiable)

| Concern | This project |
|---|---|
| Components dir | `src/components/ui/` |
| `cn` util | `import { cn } from "../../lib/utils"` (relative) — file is `src/lib/utils.ts` |
| Tailwind | **v4, CSS-first**. Config lives in `src/index.css` (`@import "tailwindcss"`). Do NOT create `tailwind.config.js`. |
| Styling tokens | CSS vars in `src/index.css` `:root` (e.g. `--bg`, `--text`, `--accent`) |
| Component style | `React.forwardRef`, set `displayName`, **named** export: `export { Component }` |
| Animations | `tailwindcss-animate` + `framer-motion`/`gsap` already installed |
| Icons | `lucide-react` (also `react-icons` available) |

## The import alias gotcha (READ THIS)

The `@` alias maps to the **project root**, not `src`:

```jsonc
// tsconfig.json + vite.config.ts
"@/*": ["./*"]          // @ === project root
```

shadcn components are generated with imports like `import { cn } from "@/lib/utils"`.
**That path is wrong here** — it would resolve to `<root>/lib/utils`, which does not
exist. After adding any component, rewrite its imports to ONE of:

- Relative (matches existing `src/components/ui/*`): `"../../lib/utils"` ✅ preferred
- Aliased to the real location: `"@/src/lib/utils"`

Do the same for any `@/components/...` import → `@/src/components/...` or relative.

## After adding a component

- [ ] Imports fixed (no bare `@/lib/...` or `@/components/...`).
- [ ] `cn` resolves; component uses `cn(...)` for class merging.
- [ ] No `tailwind.config.js` was created; new tokens (if any) added to `src/index.css`.
- [ ] Type check passes: `npm run lint` (runs `tsc --noEmit`).
- [ ] Run `mcp__shadcn__get_audit_checklist` and address items.

## Common mistakes

- Creating `tailwind.config.js` — this is Tailwind v4, config is in CSS.
- Leaving `@/lib/utils` imports — breaks because `@` = root, not `src`.
- Default exports — this repo uses named exports for ui components.
- Skipping `view`/examples and guessing the API — inspect via MCP first.
