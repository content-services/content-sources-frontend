# Toolbar unit — roadmap

**Scope of this file:** this unit only — the generic PF `Toolbar` shell and its
implementation phases.

**Not in this file:** filter/action/pagination slot grammar, canonical filter
order, or any DataView-specific behavior. Those live in
[`../data-view/data-view-toolbar/ROADMAP.md`](../data-view/data-view-toolbar/ROADMAP.md).

---

## Job

Generic **Toolbar shell**: PF `Toolbar` + Lightwell config (ouiaId default,
default clear-filters link). Does not know about filters, actions, pagination,
or bulk-select — those are a higher-level grammar that consuming units build on
top via `children`.

**Host:** PF `Toolbar` — logic harness, not a from-scratch toolbar.

**Generalizes from (read before touching, don't reinvent):**
- `@patternfly/react-data-view`'s `DataViewToolbar` — its outer `<Toolbar
  ouiaId className customLabelGroupContent {...props}>` call is the exact shape
  this unit wraps; `data-view/data-view-toolbar/` rebuilds the rest
  (`ToolbarContent` slot assembly) on top of this unit instead of depending on
  `DataViewToolbar` directly.

---

## Phases

| Phase | Work | Status |
| ----- | ---- | ------ |
| 1 | Bare `Toolbar` wrapper + ouiaId default + default clear-filters link | Done |
| 2 | `data-view/data-view-toolbar/` rewired to consume this unit instead of PF `DataViewToolbar` | Done |

---

## Explicitly out of scope

- Filters / actions / pagination slots, bulk-select, toggle-group — **data-view-toolbar** unit
- Canonical filter/search order — **data-view-toolbar** unit
- Any product/domain wiring — stays with call sites
