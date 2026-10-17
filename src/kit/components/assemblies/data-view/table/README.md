# LwDataView

> **Status:** implemented (non-compact default via `components.config.ts`
> config cascade, sticky-column passthrough, outer-host `selection`/`footer`/
> wrapper props for Repositories/Packages). Family: [`../ROADMAP.md`](../ROADMAP.md).
> Unit roadmap: [`ROADMAP.md`](./ROADMAP.md).

## Why it exists

Thin `DataView` + `DataViewTable` wrapper so product pages get PatternFly's
DataView pattern with Lightwell-specific defaults baked in, instead of each
page configuring `@patternfly/react-data-view` from scratch: non-compact density
by default (compact is reserved for drawers/modals, not primary page views),
native sticky-column/header support exposed directly, and named slots for the
outer `DataView` host's `selection`/`className`/`style`/`ouiaId` (distinct from
the inner table's own `className`/`style`/`ouiaId`).

## What it can do

| Capability | Notes |
| ---------- | ----- |
| Rows / columns | Pass `DataViewTh[]` / `DataViewTr[]` as-is — same shape as raw `DataViewTable` |
| Active state | `activeState` + `bodyStates` / `headStates`, same contract as `DataView` + `DataViewTableBasic` |
| Density | Defaults to non-compact (`components.config.ts`'s `dataView.isCompact`); pass `isCompact` to opt in explicitly |
| Sticky columns/header | `isSticky` toggles sticky header; per-column stickiness via each column/row's own `props.isStickyColumn` (native PF `Th`/`Td` passthrough — no kit-specific API) |
| Chrome above the table | `children` render inside `DataView`, above the table — pass a toolbar unit here |
| Chrome below the table | `footer` renders inside `DataView`, after the table — e.g. a bottom pagination toolbar |
| Selection | `selection` wires a `DataViewSelection` (from `useDataViewSelection`) to the outer `DataView`, enabling per-row checkboxes on `DataViewTable` |
| Outer-host styling/id | `wrapperClassName` / `wrapperStyle` / `containerOuiaId` apply to the outer `DataView` host — separate from `className`/`style`/`ouiaId` in `...rest`, which apply to the inner `DataViewTable` |

## How it works

- **Tier:** assembly under `assemblies/data-view/table/`
- **Host:** `@patternfly/react-data-view`'s `DataView` + `DataViewTable`
- Generalizes the pattern already used by
  `src/Pages/Repositories/ContentListTable/ContentListTable.tsx`,
  `src/components/Tables/Packages/PackagesTableWithToolbars.tsx`, and
  `src/Pages/Lightwell/Lens/components/PackageCoverageTable.tsx`
- Prop defaults flow through `components.config.ts`'s `dataView` entry via
  `mergeComponentProps` — see [`src/kit/README.md`](../../../../README.md#config-cascade)

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
| `isCompact?` | Opt into PF compact density (default: non-compact, from `components.config.ts`) |
| `isSticky?` | Sticky header + sticky columns |
| `children?` | Chrome rendered above the table, inside `DataView` (e.g. a toolbar unit) |
| `footer?` | Chrome rendered after the table, inside `DataView` (e.g. a bottom pagination toolbar) |
| `selection?` | `DataViewSelection` applied to the outer `DataView` — enables row checkboxes |
| `wrapperClassName?` / `wrapperStyle?` | Applied to the outer `DataView` host (page layout) |
| `containerOuiaId?` | OUIA id for the outer `DataView` host |
| ...rest | Forwarded to `DataViewTable` (minus `variant`, `columns`, `rows`, `bodyStates`, `headStates`, `isSticky`, `isTreeTable`) — includes `className`/`style`/`ouiaId` targeting the inner table |

## Out of scope

Filters, pagination controls (`../toolbar`), sort hooks (call sites use
`useDataViewSort` directly against `columns[].props.sort` — no kit API needed),
domain row/column shapes.
