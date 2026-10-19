import type { CSSProperties, ReactNode } from 'react';
import {
  DataView,
  type DataViewProps,
  type DataViewState,
} from '@patternfly/react-data-view/dist/dynamic/DataView';
import {
  DataViewTable,
  type DataViewTh,
  type DataViewTr,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import type { DataViewTableBasicProps } from '@patternfly/react-data-view/dist/dynamic/DataViewTableBasic';

import { getLwDataViewDefaults, mergeComponentProps } from '../../components.config';

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
   * Opt-in to PF's compact table density. Defaults to non-compact (see
   * `components.config.ts`'s `dataView.isCompact`) — compact is reserved for
   * drawers/modals, not primary page views (flagged 2026-10-08; see
   * `../ROADMAP.md`).
   */
  isCompact?: boolean;
  /** Toggles sticky header + sticky columns (PF `DataViewTable` `isSticky`). */
  isSticky?: boolean;
  /** Toolbar(s) and other chrome rendered above the table, inside `DataView`. */
  children?: ReactNode;
  /** Chrome rendered after the table, still inside `DataView` (e.g. a bottom pagination toolbar). */
  footer?: ReactNode;
  /** PF `DataView` selection context — wires bulk-select/checkbox state to the table. Applies to the outer `DataView` host, not the inner table. */
  selection?: DataViewProps['selection'];
  /** className for the outer `DataView` host (page layout). Distinct from `className` in `...rest`, which targets the inner `DataViewTable`. */
  wrapperClassName?: string;
  /** style for the outer `DataView` host. Distinct from `style` in `...rest`, which targets the inner `DataViewTable`. */
  wrapperStyle?: CSSProperties;
  /** OUIA id for the outer `DataView` host. Distinct from `ouiaId` in `...rest`, which targets the inner `DataViewTable`. */
  containerOuiaId?: string;
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
  footer,
  selection,
  wrapperClassName,
  wrapperStyle,
  containerOuiaId,
  ...rest
}: LwDataViewProps) {
  // Strip kit-owned isCompact from PF host defaults (maps to variant, not a literal prop).
  const { isCompact: defaultCompact, ...pfDefaults } = getLwDataViewDefaults();
  const compact = isCompact ?? defaultCompact ?? false;

  // PF host props passthrough via merge — call-site wins on everything except
  // className/style, which merge against componentsConfig.dataView.
  const tableProps = mergeComponentProps(pfDefaults, {
    ...rest,
    variant: compact ? ('compact' as const) : undefined,
    isSticky,
    columns,
    rows,
    bodyStates,
    headStates,
  });

  return (
    <DataView
      activeState={activeState}
      selection={selection}
      ouiaId={containerOuiaId}
      className={wrapperClassName}
      style={wrapperStyle}
    >
      {children}
      <DataViewTable {...tableProps} />
      {footer}
    </DataView>
  );
}

export default LwDataView;
