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
