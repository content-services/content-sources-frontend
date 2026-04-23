import { render, screen } from '@testing-library/react';
import ContentValidity from './ContentValidity';

describe('ContentValidity', () => {
  it('shows a spinner while loading', () => {
    const { container } = render(<ContentValidity loading />);

    expect(container.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });

  it('shows Valid when required fields are touched and there are no errors', () => {
    render(
      <ContentValidity
        touched={{ name: true, url: true }}
        errors={{ name: undefined, url: undefined }}
      />,
    );

    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows Invalid when a touched field has an error', () => {
    render(
      <ContentValidity
        touched={{ name: true, url: true }}
        errors={{ name: 'Required', url: undefined }}
      />,
    );

    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('renders nothing by default', () => {
    const { container } = render(<ContentValidity />);

    expect(container).toBeEmptyDOMElement();
  });
});
