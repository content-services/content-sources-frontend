import { useMemo } from 'react';
import { useGetRepoConfigFileQuery } from 'services/Content/ContentQueries';

/**
 * Copy/download actions for a repository's config.repo.
 * Targets the given snapshot, or the latest snapshot when `snapUUID` is omitted.
 * Errors are swallowed here because the query already shows an error notification.
 */
export const useRepoConfig = (repoUUID: string, snapUUID?: string) => {
  const { mutateAsync } = useGetRepoConfigFileQuery(repoUUID, snapUUID);

  return useMemo(() => {
    const copyRepoConfig = async () => {
      const data = await mutateAsync();
      await navigator.clipboard.writeText(data);
    };

    const downloadRepoConfig = async () => {
      const data = await mutateAsync();
      const url = URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
      const element = document.createElement('a');
      element.href = url;
      element.download = 'config.repo';
      document.body.appendChild(element);
      element.click();
      element.remove();
      URL.revokeObjectURL(url);
    };

    return {
      copyRepoConfig: () => copyRepoConfig().catch(() => {}),
      downloadRepoConfig: () => downloadRepoConfig().catch(() => {}),
    };
  }, [mutateAsync]);
};
