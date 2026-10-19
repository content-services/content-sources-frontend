import type { ReactNode } from 'react';
import {
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
  type ToolbarItemProps,
  type ToolbarProps,
} from '@patternfly/react-core';

import { getLwDataViewToolbarDefaults, mergeComponentProps } from '../../../components.config';
import { LwToolbar } from '../../toolbar/toolbar';

type LwDataViewToolbarOwnedProps = {
  /** React node to display bulk select, rendered first. */
  bulkSelect?: ReactNode;
  /**
   * Filter controls. Canonical order: filters, then actions, then pagination.
   * This unit always wraps this in its own unstyled `ToolbarItem` —
   * content needing precise, unwrapped placement (e.g. a fixed-width search
   * box) should go through `children` instead, which renders before the
   * pagination item.
   */
  filters?: ReactNode;
  /**
   * Non-filter actions (e.g. "Manage columns"), rendered between filters and
   * pagination. Same `ToolbarItem`-wrapping caveat as `filters` applies.
   */
  actions?: ReactNode;
  /** React node to display a toggle group, rendered after actions. */
  toggleGroup?: ReactNode;
  /**
   * Pagination control. Rendered as a `ToolbarItem` with `align: 'alignEnd'`
   * instead of PF `DataViewToolbar`'s own `pagination` prop, which misaligns
   * with top pagination — see `../ROADMAP.md` ("Known issue to carry
   * forward", commit 9bdb20c). Revert to a `pagination` prop on the host once
   * PatternFly fixes that upstream.
   */
  pagination?: ReactNode;
  /** Extra props for the pagination `ToolbarItem` (e.g. `visibility` to hide
   * top pagination on small screens). `variant` and `align` are owned by this
   * unit and can't be overridden here. */
  paginationItemProps?: Omit<ToolbarItemProps, 'variant' | 'align'>;
  /** Forwarded to `LwToolbar` — builds the default "Clear filters" link. */
  clearAllFilters?: () => void;
  /** Forwarded to `LwToolbar` — overrides the default clear-filters link entirely. */
  customLabelGroupContent?: ReactNode;
  /** Rendered before the built-in pagination item, unwrapped (unlike `filters`/`actions`). */
  children?: ReactNode;
};

/** Owned slots + PF `Toolbar` passthrough (via `LwToolbar`), minus `children` (built from the slots above). */
export type LwDataViewToolbarProps = LwDataViewToolbarOwnedProps &
  Omit<ToolbarProps, 'children' | 'ref'>;

/**
 * Kit **assembly unit** — `data-view/data-view-toolbar`. Consumes `LwToolbar`
 * as its host and rebuilds `@patternfly/react-data-view`'s `DataViewToolbar`
 * slot grammar (bulk select / filters / actions / toggle group / pagination)
 * on top of it, baking in the PF top-pagination alignment workaround so every
 * caller gets it for free. See `../ROADMAP.md` for family context.
 */
export function LwDataViewToolbar({
  bulkSelect,
  filters,
  actions,
  toggleGroup,
  pagination,
  paginationItemProps,
  children,
  ouiaId,
  ...rest
}: LwDataViewToolbarProps) {
  const toolbarProps = mergeComponentProps(getLwDataViewToolbarDefaults(), {
    ouiaId: ouiaId ?? 'DataViewToolbar',
    ...rest,
  });

  return (
    <LwToolbar {...toolbarProps}>
      <ToolbarContent>
        {bulkSelect ? (
          <ToolbarItem data-ouia-component-id={`${toolbarProps.ouiaId}-bulk-select`}>
            {bulkSelect}
          </ToolbarItem>
        ) : null}
        {filters ? <ToolbarItem>{filters}</ToolbarItem> : null}
        {actions ? <ToolbarItem>{actions}</ToolbarItem> : null}
        {toggleGroup ? <ToolbarItem>{toggleGroup}</ToolbarItem> : null}
        {children}
        {pagination ? (
          <ToolbarItem
            {...paginationItemProps}
            variant={ToolbarItemVariant.pagination}
            data-ouia-component-id={`${toolbarProps.ouiaId}-pagination`}
            align={{ default: 'alignEnd' }}
          >
            {pagination}
          </ToolbarItem>
        ) : null}
      </ToolbarContent>
    </LwToolbar>
  );
}

export default LwDataViewToolbar;
