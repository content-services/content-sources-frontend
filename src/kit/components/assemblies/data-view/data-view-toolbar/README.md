# LwDataViewToolbar

> **Status:** implemented (first cut — filters/actions/pagination slots only;
> filter primitives like `DataViewTextFilter` are not yet wrapped, call sites
> still compose them directly). Family: [`../ROADMAP.md`](../ROADMAP.md).
> Unit roadmap: [`ROADMAP.md`](./ROADMAP.md).

## Why it exists

Rebuilds `@patternfly/react-data-view`'s `DataViewToolbar` slot grammar
(filters / actions / bulk select / toggle group / pagination) on top of the kit's
own [`LwToolbar`](../../toolbar/README.md), and bakes in a known PatternFly
layout fix for top pagination, so every caller gets both for free instead of
each page reimplementing the workaround independently.

## What it can do

| Capability | Notes |
| ---------- | ----- |
| Filters / actions / bulk select / toggle group | Each renders in its own `ToolbarItem`, same canonical order as PF's `DataViewToolbar` |
| Pagination | Rendered via an end-aligned `ToolbarItem` — fixes a PF alignment bug (see [`ROADMAP.md`](./ROADMAP.md)) |
| Clear filters | `clearAllFilters` / `customLabelGroupContent` forward straight to `LwToolbar` |
| Everything else | Any other PF `Toolbar` prop passes straight through (via `LwToolbar`) |

## How it works

- **Tier:** assembly under `assemblies/data-view/data-view-toolbar/`
- **Host:** [`LwToolbar`](../../toolbar/README.md) (PF `Toolbar`) — no longer
  depends on `@patternfly/react-data-view`'s `DataViewToolbar` directly
- Generalizes the pagination-alignment fix already applied ad hoc in
  `ContentListTable.tsx` and `PackagesTableWithToolbars.tsx` (commit `9bdb20c`)

## API

```tsx
import { LwDataViewToolbar } from 'kit/components/assemblies';

<LwDataViewToolbar
  filters={<SearchInput ... />}
  actions={<Button onClick={...}>Manage columns</Button>}
  pagination={<Pagination {...paginationProps} isCompact />}
/>
```

| Prop | Role |
| ---- | ---- |
| `filters?` | Filter controls, rendered first |
| `actions?` | Non-filter actions, rendered between filters and pagination |
| `pagination?` | Pagination control, rendered end-aligned via the PF workaround |
| `paginationItemProps?` | Extra props for the pagination `ToolbarItem` (e.g. `visibility` to hide top pagination on small screens); `variant`/`align` are owned by this unit |
| `bulkSelect?` / `toggleGroup?` | Render in their own `ToolbarItem`s, same canonical order as PF's `DataViewToolbar` |
| `clearAllFilters?` / `customLabelGroupContent?` | Forwarded to `LwToolbar` |
| ...rest | Forwarded to `LwToolbar` (PF `Toolbar` props) |

## Out of scope

Table rendering (`../data-view.tsx`), filter primitive components
(`DataViewTextFilter` / `DataViewCheckboxFilter` / etc. — call sites compose
these directly for now), canonical filter ordering across call sites (open
question, see [`ROADMAP.md`](./ROADMAP.md)).
