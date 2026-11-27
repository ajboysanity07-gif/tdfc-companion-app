# TDFC Companion App

## Stack
- Laravel 12, PHP 8.3 (`composer.json` allows ^8.2), Inertia 2
- React 19 + TypeScript. React Compiler is **not** enabled.
- Tailwind 4, shadcn/ui primitives in `resources/js/components/ui/`. No MUI.
- Pest 4

## Database
- The app uses SQL Server. The local `.env` points to a **remote** server: never run migrations, seeders, tinker writes or ad-hoc SQL against it.
- Tests use in-memory SQLite (`phpunit.xml`). Make sure there is no cached config before running them.

## Product
- The app does not handle payments. Do not add "Pay now" style actions.

## Checks
- `npm run types`, `npm run build`, `./vendor/bin/pest`
- `npm run lint` rewrites files (`--fix`); to only check, use `npx eslint <files>`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
