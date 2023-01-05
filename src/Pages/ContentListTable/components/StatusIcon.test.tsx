import { render } from '@testing-library/react';
import StatusIcon from './StatusIcon';

it('Render with Pending status', () => {
  const { queryByText } = render(<StatusIcon status='Pending' />);

  const SelectComponent = queryByText('In progress');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Valid status', () => {
  const { queryByText } = render(<StatusIcon status='Valid' />);
  const SelectComponent = queryByText('Valid');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Invalid status', () => {
  const { queryByText } = render(<StatusIcon status='Invalid' />);
  const SelectComponent = queryByText('Invalid');
  expect(SelectComponent).toBeInTheDocument();
});

it('Render with Unavailable status', () => {
  const { queryByText } = render(<StatusIcon status='Unavailable' />);
  const SelectComponent = queryByText('Unavailable');
  expect(SelectComponent).toBeInTheDocument();
});
