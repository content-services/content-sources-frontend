import { render } from '@testing-library/react';
import EmptyPackageState from './EmptyPackageState';

it('Render correctly', () => {
  const { queryByText } = render(<EmptyPackageState clearSearch={() => null} />);

  expect(queryByText('No packages match the search criteria')).toBeInTheDocument();
  expect(queryByText('Clear your current search to show more results')).toBeInTheDocument();
  expect(queryByText('Clear search')).toBeInTheDocument();
});
