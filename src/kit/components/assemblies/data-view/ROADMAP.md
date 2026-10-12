# Data View family — roadmap

**Scope of this file:** family inventory, shared config, sequencing across units,
and cross-cutting conventions. Unit-specific phases live in each unit's
`ROADMAP.md` — do not duplicate them here.

**Status:** scaffolding. No data-view unit implementation until that unit's
roadmap is agreed and its README exists.

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

| Unit | Export | Job | Unit roadmap |
| ---- | ------ | --- | ------------ |
| Toolbar | `LwDataViewToolbar` (name TBD at implement) | Filters + pagination composition over `DataViewToolbar` | [`toolbar/ROADMAP.md`](./toolbar/ROADMAP.md) |
| Table | `LwDataView` | `DataView` root + `DataViewTable` + active-state wiring | [`table/ROADMAP.md`](./table/ROADMAP.md) |

Add a unit row here when a unit folder + roadmap + README are created. Do **not**
put filter-component specifics, sort/selection APIs, or sticky-column mechanics
in this file.

---

## Shared config (family-owned)

| Concern | Home | Notes |
| ------- | ---- | ----- |
| Active-state mapping (`{isLoading, isFetching, isError, count}` → `DataViewState`) | Relocate/generalize `src/Hooks/tables/useTableActiveState.ts` into kit | Already a small, generic hook — not a rewrite. |
| Empty-state body (zero vs filtered) | Relocate/generalize `src/components/EmptyTableDataView/EmptyTableDataView.tsx` into kit | Already shared by `ContentListTable` and Lens's `PackageCoverageTable`. |
| PF toolbar/pagination alignment bug workaround | Table or toolbar unit, TBD at implement | Known PF layout bug, already patched at both existing call sites in commit `9bdb20c` ("align toolbar with top pagination for all uses of PF DataView component — can revert after patternfly fixes this issue"). The kit unit must bake this in from day one, or it regresses visually versus the current hand-rolled/existing DataView tables. Revert when PatternFly fixes it upstream. |
| Compact-variant default | Table unit `components.config.ts` entry | Default `DataViewTable` to **non-compact**; compact becomes an explicit opt-in prop. Fixes Lens's current `variant='compact'` misuse on a primary page view (flagged 2026-10-08: compact reserved for drawers/modals) automatically once Lens re-points onto this unit. |
| Canonical filter/search order | Toolbar unit `components.config.ts` entry | One documented default order for filter controls, so Beacon/Lens/Repositories converge on it as they migrate, instead of each page inventing its own order. |

---

## Sequencing (family)

| Order | Work | Owner doc |
| ----- | ---- | --------- |
| D0 | Family scaffolding (this file) | this file |
| D1 | `toolbar` unit roadmap + implementation (generalize `DataViewToolbar` usage from the three existing call sites) | [`toolbar/ROADMAP.md`](./toolbar/ROADMAP.md) |
| D2 | `table` unit roadmap + implementation (`LwDataView`; bake in PF workaround, non-compact default, active-state + empty-state wiring) | [`table/ROADMAP.md`](./table/ROADMAP.md) |
| D3 | Beacon replace: `VulnerabilityTable`'s hand-rolled `Card`+`Toolbar`+raw `Table` → `LwDataView` + toolbar unit. Hardest case — sticky columns and `ColumnManagementModal` aren't solved by any existing DataView usage yet and must be proven here. | product + table/toolbar roadmaps |
| D4 | Lens re-point: `PackageCoverageTable` swaps its direct `@patternfly/react-data-view` imports for the kit units and drops `variant='compact'`. Low risk — already fully on DataView. | product |
| D5 | Optional/opportunistic: `src/Pages/Lightwell/Repositories/RepositoriesTable.tsx` (still hand-rolled `LwCard` + raw `react-table`, not DataView at all). Not committed scope — not mentioned in any planning discussion for this family. | product |

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
| Lens replace: `PackageCoverageTable` unit tests still pass; `variant='compact'` no longer present | D4 |
