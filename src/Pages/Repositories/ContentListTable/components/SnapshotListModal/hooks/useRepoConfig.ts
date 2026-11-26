import { useEffect, useMemo, useState } from 'react';
import { useGetRepoConfigFileQuery } from 'services/Content/ContentQueries';
import useErrorNotification from 'Hooks/useErrorNotification';

const COPIED_FEEDBACK_MS = 2000;

/**
 * Copy/download actions for a repository's config.repo.
 * Targets the given snapshot, or the latest snapshot when `snapUUID` is omitted.
 * Fetch errors are reported by the query, clipboard errors by this hook.
 */
export const useRepoConfig = (repoUUID: string, snapUUID?: string) => {
  const { mutateAsync } = useGetRepoConfigFileQuery(repoUUID, snapUUID);
  const errorNotifier = useErrorNotification();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const actions = useMemo(() => {
    const copyRepoConfig = async () => {
      const data = await mutateAsync().catch(() => undefined);
      if (data === undefined) return false; // Don't proceed with copy if fetch fails

      try {
        await navigator.clipboard.writeText(data);
        return true;
      } catch (err) {
        errorNotifier(
          'Unable to copy repository configuration',
          'Try again, or download the file instead.',
          err,
          'repo-config-copy-error',
        );
        return false;
      }
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
      copyRepoConfig,
      downloadRepoConfig: () => downloadRepoConfig().catch(() => {}),
    };
  }, [mutateAsync, errorNotifier]);

  return {
    ...actions,
    copyRepoConfig: async () => setCopied(await actions.copyRepoConfig()),
    copied,
  };
};
