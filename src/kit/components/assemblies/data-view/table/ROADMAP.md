# Data View table unit — roadmap

**Scope of this file:** this unit only — `DataView` root host, active-state
wiring, empty-state wiring, sticky-column/column-management strategy, and
implementation phases for `LwDataView`.

**Not in this file:** family inventory, shared config ownership, the toolbar
unit, or other data-view units. Those live in [`../ROADMAP.md`](../ROADMAP.md).

**Prerequisite:** this roadmap + `README.md` (not yet written) agreed before any
`*.tsx` / unit CSS for the table.

---

## Job

Plug-and-play **DataView root**: `DataView` + `DataViewTable` + active-state
(loading/error/empty) mapping + empty-state body. Pages pass columns, rows, and
query state; the assembly does not know Beacon/Lens fetch or domain catalogs.

**Host:** `@patternfly/react-data-view`'s `DataView` / `DataViewTable` — logic
harness, not a from-scratch table.

**Generalizes from (read before implementing, don't reinvent):**
- `src/Pages/Repositories/ContentListTable/ContentListTable.tsx` — `DataView` +
  `DataViewTable` + `useDataViewSort` + `useDataViewSelection`, bulk actions,
  active-state mapping.
- `src/Hooks/tables/useTableActiveState.ts` — already a small, generic
  `{isLoading, isFetching, isError, count} → DataViewState` hook. Relocate and
  generalize into this unit rather than rewriting.
- `src/components/EmptyTableDataView/EmptyTableDataView.tsx` — shared empty-state
  body (zero vs filtered), already used by `ContentListTable` and Lens's
  `PackageCoverageTable`. Relocate into this unit.
- `src/Pages/Lightwell/Lens/components/PackageCoverageTable.tsx` — Lightwell's
  own existing `DataView`/`DataViewTable` (`variant='compact'`, `bodyStates` for
  empty/loading/error) — confirm this unit's default output matches once Lens
  re-points, minus the compact variant (see below).

---

## Defaults to bake in (not optional at implement)

1. **Non-compact by default.** `DataViewTable`'s `variant` defaults to the PF
   default (non-compact); compact is an explicit opt-in prop. This fixes Lens's
   current `variant='compact'` misuse (confirmed at
   `src/Pages/Lightwell/Lens/components/PackageCoverageTable.tsx:271`) the
   moment Lens re-points onto this unit — flagged 2026-10-08: compact table
   variants belong in drawers/modals, not primary page views.
2. **PF toolbar/pagination alignment workaround.** See
   [`../toolbar/ROADMAP.md`](../toolbar/ROADMAP.md)'s "Known issue to carry
   forward" — whichever unit owns the DOM structure where this applies must
   include it.

---

## Beacon's unsolved requirements (first hard consumer)

Neither `ContentListTable.tsx` nor Lens's `PackageCoverageTable.tsx` currently
need these — they must be solved **in this unit** (or explicitly documented as
an escape hatch) before Beacon's `VulnerabilityTable.tsx` can migrate:

| Requirement | Current Beacon approach (hand-rolled) | Notes |
| ----------- | -------------------------------------- | ----- |
| Sticky columns | `OuterScrollContainer`/`InnerScrollContainer` from `@patternfly/react-table`, manual cell props from `vulnerabilityTableStickyColumns.ts` | Needs a DataView-compatible approach, or an explicit decision that sticky columns stay a Beacon-local wrapper around this unit |
| Column management | `ColumnManagementModal` from `@patternfly/react-component-groups`, driven by local `columns`/`onColumnsChange` state | Needs to compose cleanly with `DataViewTable`'s column API |

If either can't be solved cleanly inside the unit, document the escape hatch
here (e.g. "Beacon wraps `LwDataView` with its own sticky-column/column-mgmt
layer") rather than blocking the whole family on it.

---

## Explicitly out of scope

- Filters, pagination controls — **toolbar** unit
- Domain row/column shapes — product call sites
- Bulk actions, selection — open question whether this lives here or in toolbar;
  decide at implement by following `ContentListTable.tsx`'s existing split
