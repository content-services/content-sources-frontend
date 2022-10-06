import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OptionalTooltip from './OptionalTooltip';

const text = 'Hello';
const content = <h1>{text}</h1>;

it('Render content when show is true', async () => {
  const { queryByText } = render(
    <div>
      <OptionalTooltip content={content} show={true}>
        <div>Test</div>
      </OptionalTooltip>
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
      <OptionalTooltip content={content} show={false}>
        <div>Test</div>
      </OptionalTooltip>
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
