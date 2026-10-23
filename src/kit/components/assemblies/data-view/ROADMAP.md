# Data View family — roadmap

**Scope of this file:** family inventory, shared config, sequencing across units,
and cross-cutting conventions. Unit-specific phases live in each unit's
`ROADMAP.md` — do not duplicate them here.

**Status:** `toolbar` and `table` units implemented; Beacon replace (D3), Lens
re-point (D4), Repositories re-point (D6), and Packages re-point (D7) done.

---

## Why this family exists

`assemblies/data-view/` holds **list/collection table surfaces** — toolbar
(filters + pagination) and table (DataView root + active-state wiring). Product
pages configure them; they do not own fetch or domain catalogs.

This family is **not** new ground: `@patternfly/react-data-view` is already used
in production at `src/Pages/Repositories/ContentListTable/ContentListTable.tsx`,
`src/components/Tables/Packages/PackagesTableWithToolbars.tsx`, and Lightwell's
own `src/Pages/Lightwell/Lens/components/PackageCoverageTable.tsx`, alongside a
shared `src/Hooks/tables/useTableActiveState.ts` hook and
`src/components/EmptyTableDataView/EmptyTableDataView.tsx`. This family
**generalizes those three call sites into kit units** — it does not invent new
DataView usage.

**Non-destructive:** first product wiring **replaces** a call site (Beacon
`VulnerabilityTable`'s hand-rolled `Card`+`Toolbar`+raw `Table`) by swapping in
kit units. Existing domain components stay until each replace lands, per the
migrate/dissolve convention in
[`scaffold-outline/examples/dissolution-map.md`](../../../../../.cursor/skills/scaffold-outline/examples/dissolution-map.md).

---

## Inventory

| Unit    | Export              | Job                                                     | Unit docs                                                                                                                                                        |
| ------- | ------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toolbar | `LwDataViewToolbar` | Filters + pagination composition over `DataViewToolbar` | [`data-view-toolbar/README.md`](./data-view-toolbar/README.md) · [`data-view-toolbar/ROADMAP.md`](./data-view-toolbar/ROADMAP.md)                                |
| Table   | `LwDataView`        | `DataView` root + `DataViewTable` + active-state wiring | This file (see "Table unit" below) — `data-view.tsx` sits flat at the family root, same as `page/page-chrome-slots.tsx`, so it carries no separate unit-doc pair |

Add a unit row here when a unit folder + roadmap + README are created. Do **not**
put filter-component specifics, sort/selection APIs, or sticky-column mechanics
in this file.

**2026-10-19 rehome:** `table/table.tsx` → `data-view.tsx` (flattened to the
family root); `toolbar/` → `data-view-toolbar/` (renamed). Both units'
previous content (`table/README.md`, `table/ROADMAP.md`) is folded into this
file below instead of carrying forward a separate doc pair for the now-flat
`data-view.tsx`. (A generic `LwToolbar` assembly that `LwDataViewToolbar`
could consume was explored and reverted the same day — see git history — in
favor of continuing to wrap PF's `DataViewToolbar` directly.)

---

## Shared config (family-owned)

| Concern                                                                            | Home                                                                                                                                                                                                                                                                                                                                                                                                             | Notes                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active-state mapping (`{isLoading, isFetching, isError, count}` → `DataViewState`) | **Not yet relocated.** `src/Hooks/tables/useTableActiveState.ts` stays where it is; `LwDataView` just accepts `activeState` as a prop. Call sites (including Beacon, Repositories, Packages) keep using the existing hook directly until a kit relocation is worth doing.                                                                                                                                        | Already a small, generic hook — relocate opportunistically, not blocking.                                                                                                                                                                                                                                                                     |
| Empty-state body (zero vs filtered)                                                | **Not yet relocated.** `src/components/EmptyTableDataView/EmptyTableDataView.tsx` stays where it is; pass it (or a domain-specific empty state) via `bodyStates`.                                                                                                                                                                                                                                                | Already shared by `ContentListTable`, `PackagesTableWithToolbars`, and Lens's `PackageCoverageTable`.                                                                                                                                                                                                                                         |
| PF toolbar/pagination alignment bug workaround                                     | **Implemented** in `data-view-toolbar/data-view-toolbar.tsx` (`LwDataViewToolbar`'s `pagination` slot)                                                                                                                                                                                                                                                                                                           | Known PF layout bug, already patched at both existing call sites in commit `9bdb20c`. Revert when PatternFly fixes it upstream.                                                                                                                                                                                                               |
| Compact-variant default                                                            | **Implemented** — `components.config.ts`'s `dataView.isCompact` (`false`), routed through `mergeComponentProps` in `data-view.tsx`.                                                                                                                                                                                                                                                                              | Fixes Lens's `variant='compact'` misuse on primary page views (flagged 2026-10-08: compact reserved for drawers/modals) going forward — existing consumers (Lens, Repositories, Packages) still pass `isCompact` explicitly in this pass to preserve current density; dropping it is a separate follow-up, not bundled with these migrations. |
| Outer-`DataView` host props (`selection`, layout `className`/`style`, `ouiaId`)    | **Implemented** — `data-view.tsx`'s `selection` / `wrapperClassName` / `wrapperStyle` / `containerOuiaId` own-props, applied to the outer `<DataView>` (distinct from the inner `DataViewTable`'s own `className`/`style`/`ouiaId` passthrough).                                                                                                                                                                 | Needed once Repositories/Packages (D6/D7) re-pointed — neither Beacon nor Lens used outer-host selection/layout.                                                                                                                                                                                                                              |
| Below-table chrome slot                                                            | **Implemented** — `data-view.tsx`'s `footer` prop, rendered after `DataViewTable` inside `DataView`.                                                                                                                                                                                                                                                                                                             | Needed for Repositories'/Packages' bottom pagination toolbar, which sits after the table as a direct `DataView` child — `children` alone only covers chrome _above_ the table.                                                                                                                                                                |
| Canonical filter/search order                                                      | **Still open.** `data-view-toolbar/data-view-toolbar.tsx` only fixes the _slot_ order (filters, then actions, then pagination) — which controls go inside `filters` and in what order is still undecided. Now four real callers exist (Beacon, Lens, Repositories, Packages) with different filter sets (search-only, up to search+tree+2 checkbox+origin), and no canonical order has been settled across them. | Revisit once a fifth consumer or a cross-page UX pass makes the inconsistency worth fixing; not blocking for D3–D7.                                                                                                                                                                                                                           |

---

## Sequencing (family)

| Order | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Owner doc                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| D0    | Family scaffolding (this file) — done                                                                                                                                                                                                                                                                                                                                                                                                                                    | this file                                                      |
| D1    | `toolbar` unit roadmap + implementation — done (`LwDataViewToolbar`; filters/actions/pagination slots, PF workaround baked in; filter primitives and canonical order still open)                                                                                                                                                                                                                                                                                         | [`data-view-toolbar/README.md`](./data-view-toolbar/README.md) |
| D2    | `table` unit roadmap + implementation — done (`LwDataView`; non-compact default, sticky passthrough, active/empty-state props; sort/selection not yet wired)                                                                                                                                                                                                                                                                                                             | This file (see "Table unit" above)                             |
| D3    | Beacon replace — done: `VulnerabilityTable`'s hand-rolled `Card`+`Toolbar`+raw `Table` → `LwDataView` + toolbar unit. Sticky columns proven via PF's native `DataViewTh`/`DataViewTd` `props` passthrough (`isStickyColumn` etc. — see PatternFly's `DataViewTableStickyExample`); `ColumnManagementModal` composes unchanged as a toolbar `actions` node.                                                                                                               | product + table/toolbar roadmaps                               |
| D4    | Lens re-point — done: `PackageCoverageTable` swaps its direct `@patternfly/react-data-view` imports for the kit units (`LwDataView`/`LwDataViewToolbar`). `isCompact` is passed explicitly to keep the page visually unchanged in this pass; dropping it (the `variant='compact'` misuse fix) is deferred to a follow-up pass rather than bundled with this abstraction-only swap.                                                                                       | product                                                        |
| D5    | Optional/opportunistic: `src/Pages/Lightwell/Repositories/RepositoriesTable.tsx` (still hand-rolled `LwCard` + raw `react-table`, not DataView at all). Not committed scope — not mentioned in any planning discussion for this family. Distinct from D6 below.                                                                                                                                                                                                          | product                                                        |
| D6    | Repositories re-point — done: `src/Pages/Repositories/ContentListTable/ContentListTable.tsx` swaps its direct `DataView`/`DataViewTable`/`DataViewToolbar` imports for the kit units. Required the table unit's outer-host `selection`/`wrapperClassName`/`containerOuiaId`/`footer` props (see `table/ROADMAP.md`); sort (`useDataViewSort`), row actions, and URL-synced filters stay call-site, unchanged. `isCompact` passed explicitly to preserve current density. | product                                                        |
| D7    | Packages re-point — done: `src/components/Tables/Packages/PackagesTableWithToolbars.tsx` (shared by 3 consumers — `SnapshotPackagesTab.tsx`, `PackageModal.tsx`, `TemplatePackageTab.tsx`) swaps to the kit units, preserving its external `PackagesTableProps` contract exactly. Same outer-host props as D6; `isCompact` passed explicitly.                                                                                                                            | product                                                        |

D3+ are **replace** operations at call sites — additive kit, swap imports/JSX.
Per the dissolution-map convention, leave orphaned old table code in place with
an `UNUSED` marker rather than deleting it inline during a replace.

---

## Explicitly out of family roadmap

- Sticky-column mechanics, `ColumnManagementModal` integration — **table** unit (below) (Beacon is the first consumer that needs these; neither existing DataView call site does)
- Filter component choice/props (`DataViewTextFilter`, `DataViewCheckboxFilter`, etc.), sort/selection hooks — **data-view-toolbar** unit roadmap
- Beacon/Lens page composition, where each page mounts the units — product
- Chart sizing, alert banner width, Lens/Beacon visual misalignment items — unrelated families; tracked separately

---

## Table unit (`LwDataView`) — reference

`data-view.tsx` is a flat family-root file (the "exception to the rule" —
same shape as `assemblies/page/page-chrome-slots.tsx`), so it carries no
separate unit `README.md`/`ROADMAP.md` pair. Its unit-level reference lives
here instead.

**Why it exists:** thin `DataView` + `DataViewTable` wrapper so product pages
get PatternFly's DataView pattern with Lightwell-specific defaults baked in,
instead of each page configuring `@patternfly/react-data-view` from scratch:
non-compact density by default (compact is reserved for drawers/modals, not
primary page views), native sticky-column/header support exposed directly, and
named slots for the outer `DataView` host's `selection`/`className`/`style`/
`ouiaId` (distinct from the inner table's own `className`/`style`/`ouiaId`).

**Host:** `@patternfly/react-data-view`'s `DataView` + `DataViewTable`.
Generalizes the pattern already used by
`src/Pages/Repositories/ContentListTable/ContentListTable.tsx`,
`src/components/Tables/Packages/PackagesTableWithToolbars.tsx`, and
`src/Pages/Lightwell/Lens/components/PackageCoverageTable.tsx`. Prop defaults
flow through `components.config.ts`'s `dataView` entry via `mergeComponentProps`.

**API:**

```tsx
import { LwDataView, LwDataViewToolbar } from 'kit/components/assemblies';

<LwDataView aria-label='Vulnerabilities' columns={columns} rows={rows} activeState={activeState}>
  <LwDataViewToolbar filters={<SearchInput />} pagination={<Pagination {...paginationProps} />} />
</LwDataView>;
```

| Prop                                                       | Role                                                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `columns` / `rows`                                         | `DataViewTh[]` / `DataViewTr[]` — same shape as raw `DataViewTable`; use each row/cell's `props` for sticky columns, width, etc.         |
| `activeState?` / `bodyStates?` / `headStates?`             | Same contract as `DataView` + `DataViewTableBasic`                                                                                       |
| `isCompact?`                                               | Opt into PF compact density (default: non-compact, from `components.config.ts`)                                                          |
| `isSticky?`                                                | Sticky header + sticky columns; per-column stickiness via each column/row's own `props.isStickyColumn` (native PF `Th`/`Td` passthrough) |
| `children?` / `footer?`                                    | Chrome above / below the table, inside `DataView` (e.g. a toolbar unit; a bottom pagination toolbar)                                     |
| `selection?`                                               | `DataViewSelection` applied to the outer `DataView` — enables row checkboxes                                                             |
| `wrapperClassName?` / `wrapperStyle?` / `containerOuiaId?` | Applied to the outer `DataView` host — separate from `className`/`style`/`ouiaId` in `...rest`, which target the inner `DataViewTable`   |

**Defaults baked in:**

1. Non-compact by default, routed through the config cascade (`components.config.ts`'s `dataView.isCompact`, `false`) — flagged 2026-10-08: compact table variants belong in drawers/modals, not primary page views.
2. PF toolbar/pagination alignment workaround — owned by `data-view-toolbar` (see its `ROADMAP.md`), not this unit; noted here since both units' DOM composes together inside `LwDataView`'s `children` slot.

**Beacon / Repositories / Packages requirements — solved:**

| Requirement                                               | How it's solved                                                                                                                                                                                                        |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sticky columns                                            | Native PF passthrough — each column/row's `props` field accepts `isStickyColumn` / `stickyMinWidth` / `stickyLeftOffset` / `hasRightBorder`. `isSticky` on `LwDataView` enables the sticky header + scroll containers. |
| Column management                                         | No kit API needed — `ColumnManagementModal` composes as a plain `actions` node in the toolbar unit.                                                                                                                    |
| Selection / bulk-select                                   | `selection?: DataViewSelection` applied to the outer `<DataView selection={...}>`.                                                                                                                                     |
| Page-layout className/style / outer OUIA id               | `wrapperClassName?` / `wrapperStyle?` / `containerOuiaId?`, kept separate from the inner table's own `className`/`style`/`ouiaId`.                                                                                     |
| Bottom toolbar (after the table, still inside `DataView`) | `footer?: ReactNode`, rendered after `<DataViewTable>` inside `<DataView>`.                                                                                                                                            |

**Out of scope:** filters, pagination controls (`./data-view-toolbar/`), sort
hooks (call sites use `useDataViewSort` directly against `columns[].props.sort`),
domain row/column shapes.

---

## Validation (family)

| Gate                                                                                                                                                                          | When       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Each unit: README + roadmap before `.tsx`                                                                                                                                     | every unit |
| `table` unit: PF toolbar/pagination workaround (`9bdb20c`) present, default variant is non-compact                                                                            | D2         |
| `toolbar` unit: canonical filter order documented and used                                                                                                                    | D1         |
| Beacon replace: existing `VulnerabilityTable` unit/visual tests still pass after swap                                                                                         | D3         |
| Lens replace: `PackageCoverageTable` unit tests still pass; `isCompact` kept for this pass (visual parity), dropping it is a deliberate follow-up                             | D4         |
| Repositories replace: existing `ContentListTable.test.tsx` passes unchanged after swap (ouiaId/test-id contract, filters, sort, selection, row actions, empty/loading states) | D6         |
| Packages replace: `PackagesTableWithToolbars`'s 3 consumer tests pass unchanged; dedicated unit test added to close the prior no-direct-test gap                              | D7         |
