
  # Perfumaria

  This is a code bundle for Perfumaria. The original project is available at https://www.figma.com/design/vqV5J7r76DZ6MOKCAy8d1I/Perfumaria.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Peract Design System

Reusable UI lives in `src/shared/components/peract-*`, with public exports in
each `index.ts` and separate prop types. The old `ui/*` modules only reexport
the Peract API for compatibility; new code should import from `peract-*`.
Shared helpers live in `src/shared/utils` and `src/shared/hooks`.

Use `children` for visible text. Legacy `label`, `title` and `content` props
remain as compatibility fallbacks on existing components.

```tsx
<PeractButton action={save}>Salvar</PeractButton>
<PeractInput value={name} onValueChange={setName} required>Nome</PeractInput>
<PeractSelect data={options} value={category} onValueChange={setCategory}>
  Categoria
</PeractSelect>
```

For native events, refs and React Hook Form `register`, use
`PeractInputControl`, `PeractNativeSelect` and `PeractTextarea`. Compose them
with `PeractField` and `PeractLabel` to associate a unique control ID:

```tsx
<PeractField>
  <PeractLabel>Quantidade</PeractLabel>
  <PeractInputControl type="number" min={0} {...register("quantity")} />
</PeractField>
```

Compound APIs are available for menus, dialogs, tables, tabs and navigation.
`PeractTableRoot`, `PeractSelectRoot` and `PeractPaginationRoot` are the
composition primitives; `PeractTable`, `PeractSelect` and `PeractPagination`
retain their existing higher-level APIs. `PeractButtonPrimitive` supports
`asChild`, native events and variants; both button APIs default to
`type="button"`, so submit actions must explicitly use `type="submit"`.

`PeractModal` requires `PeractModalTitle` in its children, traps focus,
supports Escape and restores focus to the opening action. Handle save
errors inside the dialog, since the background is inaccessible while open.
`PeractModalAction` also supports `submitting`, composed `heading` and
`actions`, with legacy text props retained for compatibility.

Use tokens and `peract-*` classes from `globalStyle.css`. Modal overlays,
surfaces and select popups use distinct layer tokens to keep options above
dialogs. Existing visual identity and third-party interaction engines are
preserved.

Screens are loaded lazily from `src/features`; `src/app/pages` retains
compatibility reexports. Existing business rules and data flows are preserved.

## Feature Architecture

Decants, Body Splash, Home, Dashboard, Sales, Sales History, Online Orders,
People and Settings now follow the feature boundaries already used by
Products, Categories and Login:

- `*Page.tsx`: composition of a facade and feature-specific UI.
- `components/`: views and dialogs receiving data and actions through props.
- `facade/`: local state, orchestration and typed React Hook Form state.
- `services/`: calculations, filters, validation and export operations.
- `repository/`: feature data access, including adapters to the existing local store.
- `models/`: domain and form types; `config/`: feature options and presentation configuration.

Only layers with an existing responsibility are created. No HTTP endpoints,
DTOs, mappers or persistence contracts were invented for local demo data.
Dashboard keeps its existing compatibility entry without adding a new route.
The shared store lives in `core/store`; the old `app/context` path reexports it.

The boundary tests guard composition-only entries and prevent direct runtime
imports from repositories or the shared store inside feature components.
See [guidelines/feature-refactor-qa.md](guidelines/feature-refactor-qa.md) for
characterization tests and known inherited limitations, including delayed
modal callbacks, local-only security settings and existing table type exports.

## Validation

Run `npm test` for the Vitest suite and `npm run build` for production output.
The suite includes export compatibility contracts as well as behavioral
tests; export contracts alone do not establish interaction coverage.

See [runtime-validation-report.md](runtime-validation-report.md) for QA
evidence, desktop/mobile checks and limitations. Browser validation uses
mocked APIs, not real backend persistence. A standalone TypeScript check
was not performed; Vite build does not substitute for typechecking.
  