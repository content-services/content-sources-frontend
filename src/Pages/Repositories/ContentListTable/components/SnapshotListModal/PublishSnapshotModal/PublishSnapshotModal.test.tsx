import * as reactRouterDom from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ReactQueryTestWrapper } from 'testingHelpers';
import PublishSnapshotModal from './PublishSnapshotModal';

const mockNavigate = jest.fn();
const mockMutateAsync = jest.fn(() => Promise.resolve());

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '?snapshotUUID=snap-123' }),
  useParams: () => ({ repoUUID: 'repo-123' }),
}));

jest.mock('Hooks/useRootPath', () => () => 'someUrl');

jest.mock('services/SnapshotPublish/SnapshotPublishQueries', () => ({
  usePublishSnapshotMutate: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

jest.mock('middleware/AppContext', () => ({
  useAppContext: () => ({
    rbac: { repoRead: true, repoWrite: true },
    features: { snapshots: { enabled: true, accessible: true } },
    contentOrigin: [],
    setContentOrigin: jest.fn(),
  }),
}));

it('renders publish modal with correct title', () => {
  render(
    <ReactQueryTestWrapper>
      <PublishSnapshotModal />
    </ReactQueryTestWrapper>,
  );

  expect(screen.getByText('Publish snapshot?')).toBeInTheDocument();
  expect(screen.getByText('Publish')).toBeInTheDocument();
  expect(screen.getByText('Cancel')).toBeInTheDocument();
});

it('renders unpublish modal when action=unpublish in URL', () => {
  jest.spyOn(reactRouterDom, 'useLocation').mockReturnValue({
    search: '?snapshotUUID=snap-123&action=unpublish',
    pathname: '',
    hash: '',
    state: null,
    key: 'default',
  });

  render(
    <ReactQueryTestWrapper>
      <PublishSnapshotModal />
    </ReactQueryTestWrapper>,
  );

  expect(screen.getByText('Unpublish snapshot?')).toBeInTheDocument();
  expect(screen.getByText('Unpublish')).toBeInTheDocument();
});
