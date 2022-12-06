import { render } from '@testing-library/react';
import EmptyTableState from './EmptyTableState';

it('Render EmptyTableState for Popular Repositories', () => {
  const { queryByText } = render(<EmptyTableState clearFilters={() => null} />);

  expect(queryByText('No popular repositories match the filter criteria')).toBeInTheDocument();
  expect(queryByText('Clear all filters to show more results')).toBeInTheDocument();
  expect(queryByText('Clear search filter')).toBeInTheDocument();
});
