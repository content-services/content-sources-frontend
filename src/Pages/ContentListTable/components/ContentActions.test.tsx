import { render, fireEvent } from '@testing-library/react';
import ContentActions from './ContentActions';

jest.mock('../../../middleware/AppContext', () => ({
  useAppContext: () => ({ rbac: { read: true, write: true } }),
}));

it('Render no checked repos', async () => {
  const repos = 0;
  const { queryByText } = render(
    <ContentActions
      atLeastOneRepoChecked={false}
      numberOfReposChecked={repos}
      deleteCheckedRepos={() => null}
    />,
  );

  const kebab = document.getElementById('actions-kebab');
  fireEvent.click(kebab as Element);

  const deleteButton = queryByText(`Remove ${repos} repositories`);
  expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
});

it('Render with checked repos', async () => {
  const repos = 100;
  const { queryByText } = render(
    <ContentActions
      atLeastOneRepoChecked={true}
      numberOfReposChecked={repos}
      deleteCheckedRepos={() => null}
    />,
  );

  const kebab = document.getElementById('actions-kebab');
  fireEvent.click(kebab as Element);

  const deleteButton = queryByText(`Remove ${repos} repositories`);
  expect(deleteButton).toHaveAttribute('aria-disabled', 'false');
});
