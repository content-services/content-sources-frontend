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

| Unit | Export | Job | Unit docs |
| ---- | ------ | --- | --------- |
| Toolbar | `LwDataViewToolbar` | Filters + pagination composition over `DataViewToolbar` | [`toolbar/README.md`](./toolbar/README.md) · [`toolbar/ROADMAP.md`](./toolbar/ROADMAP.md) |
| Table | `LwDataView` | `DataView` root + `DataViewTable` + active-state wiring | [`table/README.md`](./table/README.md) · [`table/ROADMAP.md`](./table/ROADMAP.md) |

Add a unit row here when a unit folder + roadmap + README are created. Do **not**
put filter-component specifics, sort/selection APIs, or sticky-column mechanics
in this file.

---

## Shared config (family-owned)

| Concern | Home | Notes |
| ------- | ---- | ----- |
| Active-state mapping (`{isLoading, isFetching, isError, count}` → `DataViewState`) | **Not yet relocated.** `src/Hooks/tables/useTableActiveState.ts` stays where it is; `LwDataView` just accepts `activeState` as a prop. Call sites (including Beacon, Repositories, Packages) keep using the existing hook directly until a kit relocation is worth doing. | Already a small, generic hook — relocate opportunistically, not blocking. |
| Empty-state body (zero vs filtered) | **Not yet relocated.** `src/components/EmptyTableDataView/EmptyTableDataView.tsx` stays where it is; pass it (or a domain-specific empty state) via `bodyStates`. | Already shared by `ContentListTable`, `PackagesTableWithToolbars`, and Lens's `PackageCoverageTable`. |
| PF toolbar/pagination alignment bug workaround | **Implemented** in `toolbar/toolbar.tsx` (`LwDataViewToolbar`'s `pagination` slot) | Known PF layout bug, already patched at both existing call sites in commit `9bdb20c`. Revert when PatternFly fixes it upstream. |
| Compact-variant default | **Implemented** — `components.config.ts`'s `dataView.isCompact` (`false`), routed through `mergeComponentProps` in `table/table.tsx`. | Fixes Lens's `variant='compact'` misuse on primary page views (flagged 2026-10-08: compact reserved for drawers/modals) going forward — existing consumers (Lens, Repositories, Packages) still pass `isCompact` explicitly in this pass to preserve current density; dropping it is a separate follow-up, not bundled with these migrations. |
| Outer-`DataView` host props (`selection`, layout `className`/`style`, `ouiaId`) | **Implemented** — `table/table.tsx`'s `selection` / `wrapperClassName` / `wrapperStyle` / `containerOuiaId` own-props, applied to the outer `<DataView>` (distinct from the inner `DataViewTable`'s own `className`/`style`/`ouiaId` passthrough). | Needed once Repositories/Packages (D6/D7) re-pointed — neither Beacon nor Lens used outer-host selection/layout. |
| Below-table chrome slot | **Implemented** — `table/table.tsx`'s `footer` prop, rendered after `DataViewTable` inside `DataView`. | Needed for Repositories'/Packages' bottom pagination toolbar, which sits after the table as a direct `DataView` child — `children` alone only covers chrome *above* the table. |
| Canonical filter/search order | **Still open.** `toolbar/toolbar.tsx` only fixes the *slot* order (filters, then actions, then pagination) — which controls go inside `filters` and in what order is still undecided. Now four real callers exist (Beacon, Lens, Repositories, Packages) with different filter sets (search-only, up to search+tree+2 checkbox+origin), and no canonical order has been settled across them. | Revisit once a fifth consumer or a cross-page UX pass makes the inconsistency worth fixing; not blocking for D3–D7. |

---

## Sequencing (family)

| Order | Work | Owner doc |
| ----- | ---- | --------- |
| D0 | Family scaffolding (this file) — done | this file |
| D1 | `toolbar` unit roadmap + implementation — done (`LwDataViewToolbar`; filters/actions/pagination slots, PF workaround baked in; filter primitives and canonical order still open) | [`toolbar/README.md`](./toolbar/README.md) |
| D2 | `table` unit roadmap + implementation — done (`LwDataView`; non-compact default, sticky passthrough, active/empty-state props; sort/selection not yet wired) | [`table/README.md`](./table/README.md) |
| D3 | Beacon replace — done: `VulnerabilityTable`'s hand-rolled `Card`+`Toolbar`+raw `Table` → `LwDataView` + toolbar unit. Sticky columns proven via PF's native `DataViewTh`/`DataViewTd` `props` passthrough (`isStickyColumn` etc. — see PatternFly's `DataViewTableStickyExample`); `ColumnManagementModal` composes unchanged as a toolbar `actions` node. | product + table/toolbar roadmaps |
| D4 | Lens re-point — done: `PackageCoverageTable` swaps its direct `@patternfly/react-data-view` imports for the kit units (`LwDataView`/`LwDataViewToolbar`). `isCompact` is passed explicitly to keep the page visually unchanged in this pass; dropping it (the `variant='compact'` misuse fix) is deferred to a follow-up pass rather than bundled with this abstraction-only swap. | product |
| D5 | Optional/opportunistic: `src/Pages/Lightwell/Repositories/RepositoriesTable.tsx` (still hand-rolled `LwCard` + raw `react-table`, not DataView at all). Not committed scope — not mentioned in any planning discussion for this family. Distinct from D6 below. | product |
| D6 | Repositories re-point — done: `src/Pages/Repositories/ContentListTable/ContentListTable.tsx` swaps its direct `DataView`/`DataViewTable`/`DataViewToolbar` imports for the kit units. Required the table unit's outer-host `selection`/`wrapperClassName`/`containerOuiaId`/`footer` props (see `table/ROADMAP.md`); sort (`useDataViewSort`), row actions, and URL-synced filters stay call-site, unchanged. `isCompact` passed explicitly to preserve current density. | product |
| D7 | Packages re-point — done: `src/components/Tables/Packages/PackagesTableWithToolbars.tsx` (shared by 3 consumers — `SnapshotPackagesTab.tsx`, `PackageModal.tsx`, `TemplatePackageTab.tsx`) swaps to the kit units, preserving its external `PackagesTableProps` contract exactly. Same outer-host props as D6; `isCompact` passed explicitly. | product |

D3+ are **replace** operations at call sites — additive kit, swap imports/JSX.
Per the dissolution-map convention, leave orphaned old table code in place with
an `UNUSED` marker rather than deleting it inline during a replace.

---

## Explicitly out of family roadmap

- Sticky-column mechanics, `ColumnManagementModal` integration — **table** unit roadmap (Beacon is the first consumer that needs these; neither existing DataView call site does)
- Filter component choice/props (`DataViewTextFilter`, `DataViewCheckboxFilter`, etc.), sort/selection hooks — **toolbar** unit roadmap
- Beacon/Lens page composition, where each page mounts the units — product
- Chart sizing, alert banner width, Lens/Beacon visual misalignment items — unrelated families; tracked separately

---

## Validation (family)

| Gate | When |
| ---- | ---- |
| Each unit: README + roadmap before `.tsx` | every unit |
| `table` unit: PF toolbar/pagination workaround (`9bdb20c`) present, default variant is non-compact | D2 |
| `toolbar` unit: canonical filter order documented and used | D1 |
| Beacon replace: existing `VulnerabilityTable` unit/visual tests still pass after swap | D3 |
| Lens replace: `PackageCoverageTable` unit tests still pass; `isCompact` kept for this pass (visual parity), dropping it is a deliberate follow-up | D4 |
| Repositories replace: existing `ContentListTable.test.tsx` passes unchanged after swap (ouiaId/test-id contract, filters, sort, selection, row actions, empty/loading states) | D6 |
| Packages replace: `PackagesTableWithToolbars`'s 3 consumer tests pass unchanged; dedicated unit test added to close the prior no-direct-test gap | D7 |
