import { render } from '@testing-library/react';
import Groups from './Groups';

jest.mock('Hooks/useRootPath', () => () => '/someUrl');

it('Render no groups', () => {
  const { queryByText } = render(<Groups groups={[]} />);
  expect(queryByText('No groups')).toBeInTheDocument();
});

it('Render children when false', () => {
  const { queryByText } = render(<Groups groups={[{ id: 'steve1', name: 'Steve' }]} />);

  const aTag = queryByText('Steve');
  expect(aTag).toBeInTheDocument();
  expect(aTag).toHaveAttribute('href', 'someUrlinventory/workspaces/steve1');
});
