import { useRef } from 'react';
import { Button, Toolbar, ToolbarItem, type ToolbarProps } from '@patternfly/react-core';

import { getLwToolbarDefaults, mergeComponentProps } from '../../components.config';

type LwToolbarOwnedProps = {
  /**
   * Builds the default "Clear filters" link (via `customLabelGroupContent`)
   * when set and no explicit `customLabelGroupContent` is provided.
   */
  clearAllFilters?: () => void;
};

export type LwToolbarProps = LwToolbarOwnedProps & Omit<ToolbarProps, 'ref'>;

/**
 * Kit **assembly unit** — generic `Toolbar` shell. Logic harness over PF's
 * bare `Toolbar`: resolves defaults, builds the default clear-filters link.
 * Caller owns the interior (`ToolbarContent` / `ToolbarGroup` / …) via
 * `children`. `LwDataViewToolbar` consumes this to build its own filters /
 * actions / pagination slot grammar — see `../data-view/data-view-toolbar/`.
 */
export function LwToolbar({
  clearAllFilters,
  customLabelGroupContent,
  ouiaId,
  children,
  ...rest
}: LwToolbarProps) {
  const toolbarProps = mergeComponentProps(getLwToolbarDefaults(), {
    ouiaId: ouiaId ?? 'LwToolbar',
    ...rest,
  });

  // Matches PF's own `DataViewToolbar`: cache the default clear-filters
  // element via `useRef` so it isn't rebuilt (and doesn't trigger extra
  // reconciliation of the label-group content) on every render.
  const defaultClearFilters = useRef(
    <ToolbarItem>
      <Button
        ouiaId={`${toolbarProps.ouiaId}-clear-all-filters`}
        variant='link'
        onClick={clearAllFilters}
        isInline
      >
        Clear filters
      </Button>
    </ToolbarItem>,
  );

  return (
    <Toolbar
      {...toolbarProps}
      customLabelGroupContent={
        customLabelGroupContent ?? (clearAllFilters ? defaultClearFilters.current : undefined)
      }
    >
      {children}
    </Toolbar>
  );
}

export default LwToolbar;
