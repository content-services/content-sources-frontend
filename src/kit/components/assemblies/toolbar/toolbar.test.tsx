import { render, screen } from '@testing-library/react';

import { LwToolbar } from './toolbar';

it('defaults ouiaId to LwToolbar', () => {
  render(
    <LwToolbar>
      <div>Content</div>
    </LwToolbar>,
  );

  expect(screen.getByText('Content').closest('[data-ouia-component-id]')).toHaveAttribute(
    'data-ouia-component-id',
    'LwToolbar',
  );
});

it('renders children as passthrough content', () => {
  render(
    <LwToolbar>
      <div data-ouia-component-id='interior'>Interior</div>
    </LwToolbar>,
  );

  expect(screen.getByTestId('interior')).toBeInTheDocument();
});

// PF's `Toolbar` renders the clear-filters link via `ToolbarLabelGroupContent`,
// which is accessibility-hidden unless the toolbar is expanded (same mechanism
// `@patternfly/react-data-view`'s `DataViewToolbar` relies on) — query with
// `hidden: true` to find it, same as a real (non-collapsed) viewport would.
it('renders a default clear-filters link when clearAllFilters is passed', () => {
  const clearAllFilters = jest.fn();
  render(<LwToolbar clearAllFilters={clearAllFilters} />);

  const clearLink = screen.getByRole('button', { name: 'Clear filters', hidden: true });
  clearLink.click();

  expect(clearAllFilters).toHaveBeenCalledTimes(1);
});

it('omits the default clear-filters link when clearAllFilters is not passed', () => {
  render(<LwToolbar />);

  expect(
    screen.queryByRole('button', { name: 'Clear filters', hidden: true }),
  ).not.toBeInTheDocument();
});

it('prefers an explicit customLabelGroupContent over the default clear-filters link', () => {
  const clearAllFilters = jest.fn();
  render(
    <LwToolbar
      clearAllFilters={clearAllFilters}
      customLabelGroupContent={<div>Custom label group</div>}
    />,
  );

  expect(screen.getByText('Custom label group')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Clear filters', hidden: true }),
  ).not.toBeInTheDocument();
});
