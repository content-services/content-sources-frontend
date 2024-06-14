import { useRepositoryParams } from 'services/Content/ContentQueries';

export default function useArchVersion() {
  const {
    isLoading,
    error,
    isError,
    data: { distribution_versions: distVersions, distribution_arches: distArches } = {
      distribution_versions: [],
      distribution_arches: [],
    },
  } = useRepositoryParams();

  const archesDisplay = (arch?: string) => {
    const result = distArches.find(({ label }) => arch === label)?.name;
    if (!result) {
      console.warn('Unknown arch ', arch);
      return arch;
    }
    return result;
  };

  const versionDisplay = (version?: string) => {
    const result = distVersions.find(({ label }) => version === label)?.name;
    if (!result) {
      console.warn('Unknown version ', version);
      return version;
    }
    return result;
  };

  return { isLoading, error, isError, archesDisplay, versionDisplay };
}
