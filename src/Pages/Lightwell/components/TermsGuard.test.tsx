import { render, screen } from '@testing-library/react';

import TermsGuard, { buildTermsUrl } from './TermsGuard';
import { ReactQueryTestWrapper } from 'testingHelpers';

jest.mock('services/Lightwell/TermsQueries', () => ({
  useTermsRequired: jest.fn(),
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({ getEnvironment: () => 'stage' }),
}));

import { useTermsRequired } from 'services/Lightwell/TermsQueries';

const renderGuard = () =>
  render(
    <ReactQueryTestWrapper>
      <TermsGuard>
        <div data-ouia-component-id='protected-content'>Protected</div>
      </TermsGuard>
    </ReactQueryTestWrapper>,
  );

it('shows loader while loading', () => {
  (useTermsRequired as jest.Mock).mockReturnValue({
    isLoading: true,
    data: undefined,
    isError: false,
  });
  renderGuard();

  expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
});

it('renders children when terms are not required', () => {
  (useTermsRequired as jest.Mock).mockReturnValue({
    isLoading: false,
    data: { required: false },
    isError: false,
  });
  renderGuard();

  expect(screen.getByTestId('protected-content')).toBeInTheDocument();
});

it('redirects to terms service when terms are required', () => {
  const originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: 'https://console.redhat.com/lightwell' },
  });

  (useTermsRequired as jest.Mock).mockReturnValue({
    isLoading: false,
    data: { required: true },
    isError: false,
  });
  renderGuard();

  expect(window.location.href).toContain('terms.stage.api.redhat.com');
  expect(window.location.href).toContain('FIEnrollment');
  expect(window.location.href).toContain('redirect=');

  Object.defineProperty(window, 'location', { writable: true, value: originalLocation });
});

it('renders children on error (fail-open)', () => {
  (useTermsRequired as jest.Mock).mockReturnValue({
    isLoading: false,
    data: undefined,
    isError: true,
  });
  renderGuard();

  expect(screen.getByTestId('protected-content')).toBeInTheDocument();
});

describe('buildTermsUrl', () => {
  it('builds a correct URL with encoded redirect', () => {
    const url = buildTermsUrl(
      'https://terms.stage.api.redhat.com',
      'https://console.redhat.com/lightwell',
    );

    expect(url).toBe(
      'https://terms.stage.api.redhat.com/svcrest/terms/presentation/isrequired?site=FIEnrollment&event=FITerms&redirect=https%3A%2F%2Fconsole.redhat.com%2Flightwell',
    );
  });
});
