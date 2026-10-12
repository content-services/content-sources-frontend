import type { ReactNode } from 'react';
import { ToolbarItem, ToolbarItemVariant, type ToolbarItemProps } from '@patternfly/react-core';
import {
  DataViewToolbar,
  type DataViewToolbarProps,
} from '@patternfly/react-data-view/dist/dynamic/DataViewToolbar';

type LwDataViewToolbarOwnedProps = {
  /** Filter controls. Canonical order: filters, then actions, then pagination. */
  filters?: ReactNode;
  /** Non-filter actions (e.g. "Manage columns"), rendered between filters and pagination. */
  actions?: ReactNode;
  /**
   * Pagination control. Rendered as a `ToolbarItem` with `align: 'alignEnd'`
   * instead of `DataViewToolbar`'s own `pagination` prop, which misaligns with
   * top pagination — see `../ROADMAP.md` ("Known issue to carry forward",
   * commit 9bdb20c). Revert to the `pagination` prop once PatternFly fixes
   * that upstream.
   */
  pagination?: ReactNode;
  /** Extra props for the pagination `ToolbarItem` (e.g. `visibility` to hide
   * top pagination on small screens). `variant` and `align` are owned by this
   * unit and can't be overridden here. */
  paginationItemProps?: Omit<ToolbarItemProps, 'variant' | 'align'>;
};

/** Owned slots + PF `DataViewToolbar` passthrough, minus its own `pagination`
 * prop (superseded by the `pagination` slot above). */
export type LwDataViewToolbarProps = LwDataViewToolbarOwnedProps &
  Omit<DataViewToolbarProps, 'pagination'>;

/**
 * Kit **assembly unit** — `data-view/toolbar`. Thin `DataViewToolbar`
 * wrapper that bakes in the PF top-pagination alignment workaround so every
 * caller gets it for free. See `../ROADMAP.md` for family context.
 */
export function LwDataViewToolbar({
  filters,
  actions,
  pagination,
  paginationItemProps,
  children,
  ...rest
}: LwDataViewToolbarProps) {
  return (
    <DataViewToolbar filters={filters} actions={actions} {...rest}>
      {pagination ? (
        <ToolbarItem
          {...paginationItemProps}
          variant={ToolbarItemVariant.pagination}
          align={{ default: 'alignEnd' }}
        >
          {pagination}
        </ToolbarItem>
      ) : null}
      {children}
    </DataViewToolbar>
  );
}

export default LwDataViewToolbar;
