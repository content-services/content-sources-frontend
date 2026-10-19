# LwToolbar

> **Status:** implemented (bare shell only — filters/actions/pagination slot
> grammar lives one layer up, in `data-view/data-view-toolbar/`). Unit roadmap:
> [`ROADMAP.md`](./ROADMAP.md).

## Why it exists

Thin PF `Toolbar` wrapper that bakes in Lightwell defaults (ouiaId, the default
"Clear filters" link) once, instead of every toolbar-shaped surface
reimplementing that boilerplate. Generalizes the outer-`Toolbar` half of
`@patternfly/react-data-view`'s `DataViewToolbar`, which is itself nothing more
than a `Toolbar` + `ToolbarContent` shell with slot-building logic on top.

## What it can do

| Capability | Notes |
| ---------- | ----- |
| Children | Passthrough — caller owns the interior (`ToolbarContent` / `ToolbarGroup` / …) |
| Clear-filters link | Pass `clearAllFilters` to get a default end-of-label-group "Clear filters" link; pass `customLabelGroupContent` to override it entirely |
| Everything else | Any other PF `ToolbarProps` (`ouiaId`, `className`, `collapseListedFiltersBreakpoint`, …) passes straight through |

## How it works

- **Tier:** assembly under `assemblies/toolbar/` (single-unit family, no nested unit folder)
- **Host:** PF `Toolbar`
- Prop defaults flow through `components.config.ts`'s `toolbar` entry via `mergeComponentProps`

## API

```tsx
import { LwToolbar } from 'kit/components/assemblies';

<LwToolbar clearAllFilters={() => resetFilters()}>
  <ToolbarContent>…</ToolbarContent>
</LwToolbar>
```

| Prop | Role |
| ---- | ---- |
| `clearAllFilters?` | Builds the default "Clear filters" link via `customLabelGroupContent` |
| `customLabelGroupContent?` | Overrides the default clear-filters link entirely |
| `children?` | Interior content — caller owns `ToolbarContent` composition |
| ...rest | Forwarded to PF `Toolbar` |

## Out of scope

Filter/action/pagination slot composition — that grammar is owned by
`assemblies/data-view/data-view-toolbar/` (`LwDataViewToolbar`), which consumes
this unit as its host.
