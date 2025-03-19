import { render, waitFor } from '@testing-library/react';
import RepositoryQuickStart from './RepositoryQuickStart';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import userEvent from '@testing-library/user-event';
import { debug } from 'jest-preview';

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
  const { getByRole } = render(
    <div>
      <RepositoryQuickStart />
    </div>,
  );

  const expansionToggle = getByRole('button', {
    name: 'Need help getting started with Preview features?',
  });
  // Confirm that the expansion panel exists and is open
  expect(expansionToggle).toBeInTheDocument();
  expect(expansionToggle).toHaveAttribute('aria-expanded', 'true');

  const linkButton = getByRole('button', {
    name: 'Build an Image with Custom Content',
  });

  // Confirm that the linkButton exists and click it
  expect(linkButton).toBeInTheDocument();
  await userEvent.click(linkButton as Element);

  // As this is the loading state, the expansion panel will remain open
  expect(expansionToggle).toHaveAttribute('aria-expanded', 'false');

  // Although the expansion panel is closed, the linkButton is still "on the dom" and hidden
  // Confirm that the link is not disabled for future interaction
  expect(linkButton).toHaveAttribute('aria-disabled', 'false');
});
