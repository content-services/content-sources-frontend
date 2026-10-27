import { render, screen } from '@testing-library/react';

import { LwDataViewToolbar } from './data-view-toolbar';

it('renders filters, actions, and pagination in canonical order', () => {
  render(
    <LwDataViewToolbar
      filters={<div>Filters</div>}
      actions={<button type='button'>Manage columns</button>}
      pagination={<div data-ouia-component-id='pagination'>Pagination</div>}
    />,
  );

  const filters = screen.getByText('Filters');
  const actions = screen.getByRole('button', { name: 'Manage columns' });
  const pagination = screen.getByTestId('pagination');

  expect(filters).toBeInTheDocument();
  expect(actions).toBeInTheDocument();
  expect(pagination).toBeInTheDocument();

  // Assert actual DOM order, not just presence — filters, then actions, then pagination.
  expect(filters.compareDocumentPosition(actions)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(actions.compareDocumentPosition(pagination)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

it('wraps pagination in an end-aligned ToolbarItem instead of the pagination prop', () => {
  render(
    <LwDataViewToolbar pagination={<div data-ouia-component-id='pagination'>Pagination</div>} />,
  );

  const paginationItem = screen.getByTestId('pagination').closest('.pf-v6-c-toolbar__item');
  expect(paginationItem).toHaveClass('pf-m-pagination');
  expect(paginationItem).toHaveClass('pf-m-align-end');
});

it('omits the pagination slot entirely when no pagination is passed', () => {
  render(<LwDataViewToolbar filters={<div>Filters</div>} />);

  expect(document.querySelector('.pf-m-pagination')).not.toBeInTheDocument();
});

it('renders children before the built-in pagination item, unwrapped', () => {
  render(
    <LwDataViewToolbar pagination={<div data-ouia-component-id='pagination'>Pagination</div>}>
      <div data-ouia-component-id='custom-child'>Custom child</div>
    </LwDataViewToolbar>,
  );

  const customChild = document.querySelector('[data-ouia-component-id="custom-child"]');
  const paginationItem = document.querySelector('.pf-m-pagination');

  // Not auto-wrapped in an extra ToolbarItem, unlike `filters`/`actions`.
  expect(customChild?.parentElement).not.toHaveClass('pf-v6-c-toolbar__item');
  // Renders before the pagination item in document order.
  expect(customChild?.compareDocumentPosition(paginationItem as Node)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
});
