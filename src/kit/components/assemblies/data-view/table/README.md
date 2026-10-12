# LwDataView

> **Status:** implemented (first cut — non-compact default, sticky-column
> passthrough; sort/selection not yet wired). Family: [`../ROADMAP.md`](../ROADMAP.md).
> Unit roadmap: [`ROADMAP.md`](./ROADMAP.md).

## Why it exists

Thin `DataView` + `DataViewTable` wrapper so product pages get PatternFly's
DataView pattern with two Lightwell-specific defaults baked in, instead of each
page configuring `@patternfly/react-data-view` from scratch: non-compact density
by default (compact is reserved for drawers/modals, not primary page views),
and native sticky-column/header support exposed directly.

## What it can do

| Capability | Notes |
| ---------- | ----- |
| Rows / columns | Pass `DataViewTh[]` / `DataViewTr[]` as-is — same shape as raw `DataViewTable` |
| Active state | `activeState` + `bodyStates` / `headStates`, same contract as `DataView` + `DataViewTableBasic` |
| Density | Defaults to non-compact; pass `isCompact` to opt in explicitly |
| Sticky columns/header | `isSticky` toggles sticky header; per-column stickiness via each column/row's own `props.isStickyColumn` (native PF `Th`/`Td` passthrough — no kit-specific API) |
| Chrome | `children` render inside `DataView`, above the table — pass a toolbar unit here |

## How it works

- **Tier:** assembly under `assemblies/data-view/table/`
- **Host:** `@patternfly/react-data-view`'s `DataView` + `DataViewTable`
- Generalizes the pattern already used by
  `src/Pages/Repositories/ContentListTable/ContentListTable.tsx` and
  `src/Pages/Lightwell/Lens/components/PackageCoverageTable.tsx`

## API

```tsx
import { LwDataView, LwDataViewToolbar } from 'kit/components/assemblies';

<LwDataView aria-label='Vulnerabilities' columns={columns} rows={rows} activeState={activeState}>
  <LwDataViewToolbar filters={<SearchInput />} pagination={<Pagination {...paginationProps} />} />
</LwDataView>
```

| Prop | Role |
| ---- | ---- |
| `columns` | `DataViewTh[]` — same shape as raw `DataViewTable` |
| `rows` | `DataViewTr[]` — same shape as raw `DataViewTable`; use each row/cell's `props` for sticky columns, width, etc. |
| `activeState?` | `DataViewState \| string` passed through to `DataView` |
| `bodyStates?` / `headStates?` | Rendered in place of rows/header for the matching `activeState` |
| `isCompact?` | Opt into PF compact density (default: non-compact) |
| `isSticky?` | Sticky header + sticky columns |
| `children?` | Chrome rendered above the table, inside `DataView` (e.g. a toolbar unit) |
| ...rest | Forwarded to `DataViewTable` (minus `variant`, `columns`, `rows`, `bodyStates`, `headStates`, `isSticky`, `isTreeTable`) |

## Out of scope

Filters, pagination controls (`../toolbar`), sort/selection hooks (not yet
wired — see [`ROADMAP.md`](./ROADMAP.md)), domain row/column shapes.
