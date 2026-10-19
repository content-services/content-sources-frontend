# Data View toolbar unit — roadmap

**Scope of this file:** this unit only — filter composition, pagination
placement, and implementation phases for the data-view toolbar.

**Not in this file:** family inventory, shared active-state/empty-state config,
the table unit, or other data-view units. Those live in
[`../ROADMAP.md`](../ROADMAP.md).

**Prerequisite:** this roadmap + `README.md` (not yet written) agreed before any
`*.tsx` / unit CSS for the toolbar.

---

## Job

Plug-and-play **toolbar composition**: filters (text / checkbox / tree, as
needed per call site) + pagination, rebuilt on top of the kit's generic
[`LwToolbar`](../../toolbar/ROADMAP.md) instead of
`@patternfly/react-data-view`'s `DataViewToolbar`. The unit does not know
Beacon/Lens/Repositories fetch or domain filter options — call sites pass
filter config and pagination state.

**Host:** [`LwToolbar`](../../toolbar/toolbar.tsx) (PF `Toolbar`) + `DataViewFilters`
family (`DataViewTextFilter`, etc., still call-site composition) — logic/composition
harness, not a from-scratch toolbar.

**Generalizes from (read before implementing, don't reinvent):**
- `src/Pages/Repositories/ContentListTable/ContentListTable.tsx` — most complete
  reference: `DataViewToolbar` + `DataViewFilters` (`DataViewTextFilter`,
  `DataViewTreeFilter`, `DataViewCheckboxFilter`) + bulk actions + top/bottom
  pagination.
- `src/components/Tables/Packages/PackagesTableWithToolbars.tsx` — simpler
  reference (bulk-select, delete kebab).
- `src/Pages/Lightwell/Lens/components/PackageCoverageTable.tsx` — Lightwell's
  own existing usage (`DataViewToolbar` + `DataViewTextFilter` +
  `DataViewCheckboxFilter`), including a second bare `DataViewToolbar` just for
  bottom pagination.

---

## Known issue to carry forward

Commit `9bdb20c` ("align toolbar with top pagination for all uses of PF
DataView component — can revert after patternfly fixes this issue") patches a
PF layout bug in both `ContentListTable.tsx` and `PackagesTableWithToolbars.tsx`.
This unit must bake that same fix in, or Beacon/Lens will visually regress on
day one versus their current (or existing) DataView tables. Revert this unit's
copy once PatternFly fixes the underlying issue upstream and remove the
workaround from the two existing call sites in the same pass.

## Host change (2026-10-19)

This unit no longer renders `@patternfly/react-data-view`'s `DataViewToolbar`
directly — it renders [`LwToolbar`](../../toolbar/toolbar.tsx) and rebuilds
`DataViewToolbar`'s `ToolbarContent` slot assembly (bulk select / filters /
actions / toggle group / pagination) itself, so the family no longer depends on
that PF package's `DataViewToolbar` component or its `DataViewToolbarProps`
type. Public API (`filters`, `actions`, `pagination`, `paginationItemProps`, …)
is unchanged; DOM output and PF classes are unchanged (same underlying
`Toolbar`/`ToolbarContent`/`ToolbarItem` primitives).

---

## Open questions (resolve at implement)

1. Export name — `LwDataViewToolbar` vs. folding filter composition directly
   into the `table` unit's root. Family `ROADMAP.md` currently lists
   `LwDataViewToolbar` as TBD.
2. Canonical filter/search-input order (family `ROADMAP.md` calls for "one
   documented default order") — needs the actual order decided here before
   Beacon/Lens/Repositories migrate, since their current orders differ.
3. Which filter primitives (`DataViewTextFilter` / `DataViewCheckboxFilter` /
   `DataViewTreeFilter`) the unit exposes directly vs. which stay call-site
   composition.

---

## Explicitly out of scope

- Table rendering, `DataView` root, active-state wiring — `../data-view.tsx`
- Sticky columns, column management — `../data-view.tsx` (Beacon's requirement)
- Generic `Toolbar` shell / clear-filters default — **toolbar** unit (`LwToolbar`)
- Domain filter option lists (statuses, severities, etc.) — product call sites
