import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CONTENT_DOCS_URL, REPOSITORIES_DOCS_URL } from 'constants/docs';
import { ZeroState } from './ZeroState';
import { useAppContext } from 'middleware/AppContext';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

jest.mock('middleware/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('Hooks/useRootPath', () => () => '/insights/content');

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@redhat-cloud-services/frontend-components/AsyncComponent', () => {
  function MockAsyncComponent({
    customTitle,
    customText,
    customSection,
    customButton,
  }: {
    customTitle: ReactNode;
    customText: ReactNode;
    customSection: ReactNode;
    customButton: ReactNode;
  }) {
    return (
      <div>
        <div>{customTitle}</div>
        <div>{customText}</div>
        <div>{customSection}</div>
        <div>{customButton}</div>
      </div>
    );
  }
  return MockAsyncComponent;
});

const defaultContext = {
  setZeroState: jest.fn(),
};

describe('ZeroState', () => {
  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
    navigateMock.mockReset();
    (useAppContext as jest.Mock).mockReturnValue(defaultContext);
  });

  it('shows both cards with correct content', () => {
    render(<ZeroState />);

    expect(screen.getByText('Start using content templates now')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Get started by creating a content template to manage updates for your RHEL systems or adding external repositories.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('About content templates')).toBeInTheDocument();
    expect(screen.getByText('About repositories')).toBeInTheDocument();
    expect(screen.getByText(/Content templates use repository snapshots/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard Operating Environment \(SOE\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Repositories provide the content sources/i)).toBeInTheDocument();
  });

  it('navigates to browse repositories from the repositories card', async () => {
    const user = userEvent.setup();

    render(<ZeroState />);

    await user.click(screen.getByRole('button', { name: 'Browse available repositories' }));
    expect(defaultContext.setZeroState).toHaveBeenCalledWith(false);
    expect(navigateMock).toHaveBeenCalledWith('/insights/content/repositories?origin=red_hat');
  });

  it('navigates to templates list from CTA button', async () => {
    const user = userEvent.setup();

    render(<ZeroState />);

    await user.click(screen.getByRole('button', { name: 'Create template' }));
    expect(defaultContext.setZeroState).toHaveBeenCalledWith(false);
    expect(navigateMock).toHaveBeenCalledWith('/insights/content/templates');
  });

  it('navigates to repositories list from CTA button', async () => {
    const user = userEvent.setup();

    render(<ZeroState />);

    await user.click(screen.getByRole('button', { name: 'Add repositories' }));
    expect(defaultContext.setZeroState).toHaveBeenCalledWith(false);
    expect(navigateMock).toHaveBeenCalledWith('/insights/content/repositories');
  });

  it('renders learn more links', () => {
    render(<ZeroState />);

    const learnMoreLinks = screen.getAllByRole('link');
    expect(learnMoreLinks).toHaveLength(2);
    expect(
      screen.getByText('Learn more about managing system content and patch updates'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Learn more about managing system content and patch updates',
      }),
    ).toHaveAttribute('href', CONTENT_DOCS_URL);
    expect(screen.getByRole('link', { name: 'Learn more about repositories' })).toHaveAttribute(
      'href',
      REPOSITORIES_DOCS_URL,
    );
  });
});
