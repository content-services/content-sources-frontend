import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConditionalTooltip from './ConditionalTooltip';

const text = 'Hello';
const content = <h1>{text}</h1>;

it('Render content when show is true', async () => {
  const { queryByText } = render(
    <div>
      <ConditionalTooltip content={content} show={true}>
        <div>Test</div>
      </ConditionalTooltip>
    </div>,
  );

  const divElement = queryByText('Test');
  expect(divElement).toBeInTheDocument();

  if (divElement) {
    userEvent.hover(divElement);
  }

  await waitFor(() => {
    expect(queryByText(text)).toBeInTheDocument();
  });
});

it('Hide content when show is false', async () => {
  const { queryByText } = render(
    <div>
      <ConditionalTooltip content={content} show={false}>
        <div>Test</div>
      </ConditionalTooltip>
    </div>,
  );

  const divElement = queryByText('Test');
  expect(divElement).toBeInTheDocument();

  if (divElement) {
    userEvent.hover(divElement);
  }

  await waitFor(() => {
    expect(queryByText(text)).not.toBeInTheDocument();
  });
});
