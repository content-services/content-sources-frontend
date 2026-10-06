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
    data: { required: true, site: 'lightwell', events: ['network', 'academic'] },
    isError: false,
  });
  renderGuard();

  expect(window.location.href).toContain('terms.stage.api.redhat.com');
  expect(window.location.href).toContain('site=lightwell');
  expect(window.location.href).toContain('event=network');
  expect(window.location.href).toContain('event=academic');
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

it('renders children when required but site/events missing (fail-open)', () => {
  (useTermsRequired as jest.Mock).mockReturnValue({
    isLoading: false,
    data: { required: true },
    isError: false,
  });
  renderGuard();

  expect(screen.getByTestId('protected-content')).toBeInTheDocument();
});

describe('buildTermsUrl', () => {
  it('builds a correct URL with encoded redirect and single event', () => {
    const url = buildTermsUrl(
      'https://terms.stage.api.redhat.com',
      'https://console.redhat.com/lightwell',
      'lightwell',
      ['network'],
    );

    expect(url).toBe(
      'https://terms.stage.api.redhat.com/svcrest/terms/presentation/isrequired?site=lightwell&event=network&redirect=https%3A%2F%2Fconsole.redhat.com%2Flightwell',
    );
  });

  it('builds a correct URL with multiple events', () => {
    const url = buildTermsUrl(
      'https://terms.stage.api.redhat.com',
      'https://console.redhat.com/lightwell',
      'lightwell',
      ['network', 'academic'],
    );

    expect(url).toBe(
      'https://terms.stage.api.redhat.com/svcrest/terms/presentation/isrequired?site=lightwell&event=network&event=academic&redirect=https%3A%2F%2Fconsole.redhat.com%2Flightwell',
    );
  });
});
