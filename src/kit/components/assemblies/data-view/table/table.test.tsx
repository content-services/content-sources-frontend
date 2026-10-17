import { render, screen } from '@testing-library/react';
import { DataViewState } from '@patternfly/react-data-view/dist/dynamic/DataView';

import { LwDataView } from './table';

const columns = [{ cell: 'Name' }, { cell: 'Status' }];
const rows = [
  [{ cell: 'Row one' }, { cell: 'OK' }],
  [{ cell: 'Row two' }, { cell: 'OK' }],
];

it('renders rows by default (non-compact)', () => {
  render(<LwDataView aria-label='Example table' columns={columns} rows={rows} />);

  const table = screen.getByRole('grid', { name: 'Example table' });
  expect(table).toBeInTheDocument();
  expect(table).not.toHaveClass('pf-m-compact');
  expect(screen.getByText('Row one')).toBeInTheDocument();
  expect(screen.getByText('Row two')).toBeInTheDocument();
});

it('opts into compact density only when isCompact is set', () => {
  render(<LwDataView aria-label='Compact table' columns={columns} rows={rows} isCompact />);

  expect(screen.getByRole('grid', { name: 'Compact table' })).toHaveClass('pf-m-compact');
});

it('renders the matching bodyStates node for the active state', () => {
  render(
    <LwDataView
      aria-label='Empty table'
      columns={columns}
      rows={[]}
      activeState={DataViewState.empty}
      bodyStates={{ [DataViewState.empty]: <div>Nothing here</div> }}
    />,
  );

  expect(screen.getByText('Nothing here')).toBeInTheDocument();
});

it('renders toolbar/chrome children above the table inside DataView', () => {
  render(
    <LwDataView aria-label='With chrome' columns={columns} rows={rows}>
      <div data-ouia-component-id='toolbar'>Toolbar</div>
    </LwDataView>,
  );

  expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  expect(screen.getByRole('grid', { name: 'With chrome' })).toBeInTheDocument();
});

it('renders footer chrome after the table, still inside DataView', () => {
  render(
    <LwDataView
      aria-label='With footer'
      columns={columns}
      rows={rows}
      footer={<div data-ouia-component-id='bottom-toolbar'>Bottom toolbar</div>}
    >
      <div data-ouia-component-id='top-toolbar'>Top toolbar</div>
    </LwDataView>,
  );

  const topToolbar = screen.getByTestId('top-toolbar');
  const footer = screen.getByTestId('bottom-toolbar');
  const table = screen.getByRole('grid', { name: 'With footer' });

  expect(topToolbar.compareDocumentPosition(table)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(table.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

it('applies selection to the outer DataView so rows become selectable', () => {
  const selection = { onSelect: jest.fn(), isSelected: () => false };
  render(
    <LwDataView
      aria-label='Selectable table'
      columns={columns}
      rows={rows}
      selection={selection}
    />,
  );

  // DataViewTable only renders a per-row checkbox column when `selection`
  // reaches the outer DataView's InternalContext (isSelectable), not the
  // inner DataViewTable directly.
  expect(screen.getAllByRole('checkbox')).toHaveLength(rows.length);
});

it('applies wrapperClassName/wrapperStyle/containerOuiaId to the outer DataView host, distinct from the inner table', () => {
  render(
    <LwDataView
      aria-label='Wrapped table'
      columns={columns}
      rows={rows}
      wrapperClassName='custom-wrapper'
      wrapperStyle={{ padding: 8 }}
      containerOuiaId='page-data-view'
    />,
  );

  const wrapper = document.querySelector('[data-ouia-component-id="page-data-view-stack"]');
  expect(wrapper).toBeInTheDocument();
  expect(wrapper).toHaveClass('custom-wrapper');
  expect(wrapper).toHaveStyle({ padding: '8px' });

  // Inner table keeps its own default ouia id — containerOuiaId never reaches it.
  expect(
    document.querySelector('[data-ouia-component-id="DataViewTableBasic"]'),
  ).toBeInTheDocument();
});
