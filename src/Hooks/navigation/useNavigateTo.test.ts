import { renderHook, act } from '@testing-library/react';
import { useNavigateTo } from './useNavigateTo';
import { ContentOrigin } from 'services/Content/ContentApi';

const mockNavigate = jest.fn();

const REPO_UUID = '12345678-1234-4234-8234-123456789012';
const TEMPLATE_UUID = '87654321-4321-4321-8321-210987654321';

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ repoUUID: REPO_UUID, templateUUID: TEMPLATE_UUID }),
}));

jest.mock('Hooks/useRootPath', () => () => '/app');

jest.mock('middleware/AppContext', () => ({
  useAppContext: jest.fn(),
}));

import { useAppContext } from 'middleware/AppContext';

describe('useNavigateTo', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (useAppContext as jest.Mock).mockReturnValue({ contentOrigin: [] });
  });

  describe('repositories', () => {
    it('navigates to /app/repositories without origin query by default', () => {
      const { result } = renderHook(() => useNavigateTo('repositories'));

      act(() => {
        result.current();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/repositories');
    });

    it('appends origin query when only Red Hat is selected', () => {
      (useAppContext as jest.Mock).mockReturnValue({
        contentOrigin: [ContentOrigin.REDHAT],
      });

      const { result } = renderHook(() => useNavigateTo('repositories'));

      act(() => {
        result.current();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/repositories?origin=red_hat');
    });
  });

  describe('repositorySnapshots', () => {
    it('navigates to /app/repositories/<repoUUID>/snapshots', () => {
      const { result } = renderHook(() => useNavigateTo('repositorySnapshots'));

      act(() => {
        result.current();
      });

      expect(mockNavigate).toHaveBeenCalledWith(`/app/repositories/${REPO_UUID}/snapshots`);
    });
  });

  describe('root', () => {
    it('navigates to /app without origin query by default', () => {
      const { result } = renderHook(() => useNavigateTo('root'));

      act(() => {
        result.current();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });

    it('appends origin query when only Red Hat is selected', () => {
      (useAppContext as jest.Mock).mockReturnValue({
        contentOrigin: [ContentOrigin.REDHAT],
      });

      const { result } = renderHook(() => useNavigateTo('root'));

      act(() => {
        result.current();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app?origin=red_hat');
    });
  });

  describe('templates', () => {
    it('navigates to /app/templates', () => {
      const { result } = renderHook(() => useNavigateTo('templates'));

      act(() => {
        result.current();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/templates');
    });
  });

  describe('adminTasks', () => {
    it('navigates to /app/repositories/admin-tasks', () => {
      const { result } = renderHook(() => useNavigateTo('adminTasks'));

      act(() => {
        result.current();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/app/repositories/admin-tasks');
    });
  });
});
