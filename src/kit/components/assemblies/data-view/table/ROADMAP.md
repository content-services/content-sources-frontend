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

1. **Non-compact by default — done, routed through the config cascade.**
   `isCompact` resolves via `components.config.ts`'s `dataView.isCompact`
   (`false`) through `mergeComponentProps`, same pattern as `LwMetricsStepper`'s
   `isHorizontal`, rather than a raw component-level default. Compact remains an
   explicit opt-in prop. Flagged 2026-10-08: compact table variants belong in
   drawers/modals, not primary page views — Repositories/Packages (D6/D7) still
   pass `isCompact` explicitly to preserve their current density, matching
   Lens's D4 approach.
2. **PF toolbar/pagination alignment workaround.** See
   [`../toolbar/ROADMAP.md`](../toolbar/ROADMAP.md)'s "Known issue to carry
   forward" — whichever unit owns the DOM structure where this applies must
   include it.

---

## Beacon's requirements — solved (D3 done)

Neither `ContentListTable.tsx` nor Lens's `PackageCoverageTable.tsx` needed
these, but both are now proven in `LwDataView` via Beacon's migration
(`src/Pages/Lightwell/Beacon/components/VulnerabilityTable.tsx`):

| Requirement | How it's solved |
| ----------- | ---------------- |
| Sticky columns | Native PF passthrough — each column/row's `props` field accepts `isStickyColumn` / `stickyMinWidth` / `stickyLeftOffset` / `hasRightBorder`, same as PatternFly's own `DataViewTableStickyExample`. `isSticky` on `LwDataView` enables the sticky header + scroll containers (replacing the old manual `OuterScrollContainer`/`InnerScrollContainer` wrapping). Beacon's existing `vulnerabilityTableStickyColumns.ts` helper is reused unchanged — it already returned PF `Th`/`Td`-shaped props. |
| Column management | No kit API needed — `ColumnManagementModal` composes as a plain `actions` node in the toolbar unit, driven by the same call-site `columns`/`onColumnsChange` state as before. The column-visibility filter happens when building the `columns`/`rows` arrays passed to `LwDataView`. |

No escape hatch needed.

---

## Repositories' and Packages' requirements — solved (D6/D7 done)

Neither Beacon nor Lens needed these, but Repositories (`ContentListTable.tsx`)
and Packages (`PackagesTableWithToolbars.tsx`) both put `selection` and
page-layout `className`/`ouiaId` directly on the **outer** `<DataView>` —
distinct from the inner `DataViewTable`'s own `className`/`style`/`ouiaId`,
which already flow through `...rest`. Resolved by adding named outer-host
own-props rather than overloading `className`/`style`/`ouiaId`:

| Requirement | How it's solved |
| ----------- | ---------------- |
| Selection / bulk-select | `selection?: DataViewSelection` applied to the outer `<DataView selection={...}>` — this is how PF wires per-row checkbox context to `DataViewTable`, so it can't land on the inner table. |
| Page-layout className/style | `wrapperClassName?` / `wrapperStyle?` applied to the outer `<DataView>` — kept separate from `className`/`style` in `...rest` (inner table) to avoid ambiguity about which host a plain `className` prop would target. |
| Outer OUIA id | `containerOuiaId?` applied to the outer `<DataView ouiaId={...}>` — kept separate from the inner table's own `ouiaId` (in `...rest`), since Repositories/Packages use two distinct ids simultaneously. |
| Bottom toolbar (after the table, still inside `DataView`) | `footer?: ReactNode`, rendered after `<DataViewTable>` inside `<DataView>` — `children` alone only covers chrome *above* the table. |

## Explicitly out of scope

- Filters, pagination controls — **toolbar** unit
- Domain row/column shapes — product call sites
