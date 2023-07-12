import { render, fireEvent } from '@testing-library/react';
import ContentActions from './ContentActions';

jest.mock('../../../middleware/AppContext', () => ({
  useAppContext: () => ({ rbac: { read: true, write: true } }),
}));

it('Render no checked repos', async () => {
  const { queryByText } = render(
    <ContentActions atLeastOneRepoChecked={false} deleteCheckedRepos={() => null} />,
  );

  const kebab = document.getElementById('actions-kebab');
  fireEvent.click(kebab as Element);

  const deleteButton = queryByText('Remove all');
  expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
});

it('Render with checked repos', async () => {
  const { queryByText } = render(
    <ContentActions atLeastOneRepoChecked={true} deleteCheckedRepos={() => null} />,
  );

  const kebab = document.getElementById('actions-kebab');
  fireEvent.click(kebab as Element);

  const deleteButton = queryByText('Remove all');
  expect(deleteButton).toHaveAttribute('aria-disabled', 'false');
});
