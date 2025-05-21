import { render } from '@testing-library/react';
import Workspace from './Workspace';

jest.mock('Hooks/useRootPath', () => () => '/someUrl');

it('Render no workspace', async () => {
  const { queryByText } = render(<Workspace workspace={[]} />);
  expect(queryByText('No workspace')).toBeInTheDocument();
});

it('Render workspace', () => {
  const { getByRole } = render(<Workspace workspace={[{ id: 'steve1', name: 'Steve' }]} />);

  const aTag = getByRole('link', { name: 'Steve' });
  expect(aTag).toBeInTheDocument();
  expect(aTag).toHaveAttribute('href', 'someUrlinventory/workspaces/steve1');
});
