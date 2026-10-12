import type { ReactNode } from 'react';
import { DataView, type DataViewState } from '@patternfly/react-data-view/dist/dynamic/DataView';
import {
  DataViewTable,
  type DataViewTh,
  type DataViewTr,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import type { DataViewTableBasicProps } from '@patternfly/react-data-view/dist/dynamic/DataViewTableBasic';

type LwDataViewOwnedProps = {
  /** DataView's loading/error/empty state. See `useTableActiveState`-style hooks at call sites. */
  activeState?: DataViewState | string;
  /** Column definitions. Supports PF `Th` passthrough via `props` (sort, sticky, width, …). */
  columns: DataViewTh[];
  /** Row definitions. Supports PF `Td` passthrough via `props`, including
   * `isStickyColumn` / `hasLeftBorder` / `hasRightBorder` for sticky columns —
   * no escape hatch needed, PF's DataView table supports this natively
   * (see PatternFly's `DataViewTableStickyExample`). */
  rows: DataViewTr[];
  /** Table head/body states to render per `activeState` (e.g. empty-state body). */
  bodyStates?: Partial<Record<DataViewState | string, ReactNode>>;
  headStates?: Partial<Record<DataViewState | string, ReactNode>>;
  /**
   * Opt-in to PF's compact table density. Defaults to non-compact — compact
   * is reserved for drawers/modals, not primary page views (flagged
   * 2026-10-08; see `../ROADMAP.md`).
   */
  isCompact?: boolean;
  /** Toggles sticky header + sticky columns (PF `DataViewTable` `isSticky`). */
  isSticky?: boolean;
  /** Toolbar(s) and other chrome rendered above/below the table, inside `DataView`. */
  children?: ReactNode;
};

export type LwDataViewProps = LwDataViewOwnedProps &
  Omit<
    DataViewTableBasicProps,
    'variant' | 'columns' | 'rows' | 'bodyStates' | 'headStates' | 'isSticky' | 'isTreeTable'
  >;

/**
 * Kit **assembly unit** — `data-view/table`. Thin `DataView` + `DataViewTable`
 * wrapper: defaults to non-compact, passes sticky-column/header props through
 * natively. Generalizes the pattern already used by
 * `ContentListTable.tsx` / `PackageCoverageTable.tsx`. See `../ROADMAP.md`.
 */
export function LwDataView({
  activeState,
  columns,
  rows,
  bodyStates,
  headStates,
  isCompact,
  isSticky,
  children,
  ...rest
}: LwDataViewProps) {
  return (
    <DataView activeState={activeState}>
      {children}
      <DataViewTable
        {...rest}
        variant={isCompact ? 'compact' : undefined}
        isSticky={isSticky}
        columns={columns}
        rows={rows}
        bodyStates={bodyStates}
        headStates={headStates}
      />
    </DataView>
  );
}

export default LwDataView;
