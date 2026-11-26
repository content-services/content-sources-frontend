import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TypeLabel from './TypeLabel';

const uploadTooltip = 'New content uploads trigger a snapshot.';
const partnerTooltip = 'Provided by a partner organization.';

describe('TypeLabel', () => {
  it('renders the Red Hat label', () => {
    render(<TypeLabel type='redHat' />);
    expect(screen.getByText('Red Hat')).toBeInTheDocument();
  });

  it('renders the Upload label', () => {
    render(<TypeLabel type='upload' />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('renders the Remote label', () => {
    render(<TypeLabel type='remote' />);
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('renders the Partner label', () => {
    render(<TypeLabel type='partner' />);
    expect(screen.getByText('Partner')).toBeInTheDocument();
  });

  it('shows the default tooltip on hover', async () => {
    render(<TypeLabel type='upload' />);

    expect(screen.queryByText(uploadTooltip)).not.toBeInTheDocument();
    await userEvent.hover(screen.getByText('Upload'));
    await waitFor(() => expect(screen.getByText(uploadTooltip)).toBeInTheDocument());
  });

  it('does not show a tooltip when hideTooltip is set', async () => {
    render(<TypeLabel type='upload' hideTooltip />);

    await userEvent.hover(screen.getByText('Upload'));
    await waitFor(() => expect(screen.queryByText(uploadTooltip)).not.toBeInTheDocument());
  });

  it('replaces the default label and tooltip with overrides', async () => {
    render(<TypeLabel type='partner' label='Community' tooltip='Community tooltip' />);

    expect(screen.queryByText('Partner')).not.toBeInTheDocument();
    expect(screen.queryByText('Community tooltip')).not.toBeInTheDocument();
    await userEvent.hover(screen.getByText('Community'));
    await waitFor(() => expect(screen.getByText('Community tooltip')).toBeInTheDocument());
    expect(screen.queryByText(partnerTooltip)).not.toBeInTheDocument();
  });
});
