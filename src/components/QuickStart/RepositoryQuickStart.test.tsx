import { render } from '@testing-library/react';
import RepositoryQuickStart from './RepositoryQuickStart';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import userEvent from '@testing-library/user-event';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: jest.fn(),
}));

it('Confirm that RepositoryQuickStart is hidden if not inBeta', () => {
  (useChrome as jest.Mock).mockImplementation(() => ({
    isBeta: () => false,
    quickStarts: { activateQuickstart: () => new Promise((resolve) => resolve(undefined)) },
  }));
  const { queryByText } = render(
    <div>
      <RepositoryQuickStart />
    </div>,
  );

  // Confirm that the expansion panel does not exist
  expect(queryByText('Need help getting started with Preview features?')).not.toBeInTheDocument();
});

it('Confirm that QuickStart is shown, can be clicked, and then collapses', async () => {
  (useChrome as jest.Mock).mockImplementation(() => ({
    isBeta: () => true,
    quickStarts: { activateQuickstart: () => setTimeout(() => undefined, 0) },
  }));
  const { getByRole, getByText } = render(
    <div>
      <RepositoryQuickStart />
    </div>,
  );

  const expansionToggle = getByText('Need help getting started with Preview features?');
  // Confirm that the expansion panel exists and is open
  expect(expansionToggle).toBeInTheDocument();

  const region = getByRole('region');
  expect(region).not.toHaveAttribute('hidden');

  const linkButton = getByRole('button', {
    name: 'Build an Image with Custom Content',
  });

  // Confirm that the linkButton exists and click it
  expect(linkButton).toBeInTheDocument();
  await userEvent.click(linkButton as Element);

  // This is the main panel
  expect(region).toHaveAttribute('hidden');
});
