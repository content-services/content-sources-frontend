import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadStatusItem from './UploadStatusItem';

describe('UploadStatusItem', () => {
  it('formats small byte sizes and larger units', () => {
    const { rerender } = render(
      <UploadStatusItem fileName='a.txt' progressValue={0} fileSize={500} />,
    );

    expect(screen.getByText('500B')).toBeInTheDocument();

    rerender(<UploadStatusItem fileName='a.txt' progressValue={0} fileSize={2000} />);

    expect(screen.getByText('2KB')).toBeInTheDocument();
  });

  it('shows a fallback when the file size exceeds supported units', () => {
    render(<UploadStatusItem fileName='huge.bin' progressValue={0} fileSize={1e15} />);

    expect(screen.getByText('File size too large')).toBeInTheDocument();
  });

  it('invokes retry when progress is in danger state', async () => {
    const user = userEvent.setup();
    const retry = jest.fn();

    render(
      <UploadStatusItem
        fileName='bad.rpm'
        progressValue={100}
        progressVariant='danger'
        retry={retry}
      />,
    );

    await user.click(screen.getByText('Retry'));

    expect(retry).toHaveBeenCalled();
  });

  it('does not show retry when variant is not danger', () => {
    render(
      <UploadStatusItem
        fileName='ok.rpm'
        progressValue={100}
        progressVariant='success'
        retry={jest.fn()}
      />,
    );

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });
});
