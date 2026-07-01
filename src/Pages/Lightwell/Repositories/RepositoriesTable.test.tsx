import { render, screen } from '@testing-library/react';

import RepositoriesTable from './RepositoriesTable';

jest.mock('components/Header/Header', () => {
  function MockHeader({ title }: { title: string }) {
    return <div>{title}</div>;
  }
  return MockHeader;
});

it('renders the Lightwell repositories empty state', () => {
  render(<RepositoriesTable />);

  expect(screen.getByText('Lightwell - Repositories')).toBeInTheDocument();
  expect(screen.getByText('No repositories')).toBeInTheDocument();
  expect(screen.getByText('No Lightwell repositories are available yet.')).toBeInTheDocument();
});
