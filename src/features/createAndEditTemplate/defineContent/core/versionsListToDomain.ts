import {
  ALLOWED_ARCHITECTURES,
  ALLOWED_OS_VERSIONS,
  AllowedArchitecture,
  AllowedOSVersion,
  Architecture,
  OSVersion,
} from 'features/createAndEditTemplate/shared/types/types';
import { RepositoryVersionResponse, RepositoryVersionsLists } from './types';

type ToDomain = (raw: RepositoryVersionResponse | undefined) => RepositoryVersionsLists;

export const toDomain: ToDomain = (raw) => {
  if (!raw) {
    return { osVersions: [], architectures: [] };
  }

  const { distribution_versions, distribution_arches } = raw;

  const osVersionsList = distribution_versions
    .filter((version) => ALLOWED_OS_VERSIONS.includes(version.label as AllowedOSVersion))
    .map((version) => ({ displayName: version.name, descriptor: version.label }) as OSVersion);

  const architecturesList = distribution_arches
    .filter((architecture) =>
      ALLOWED_ARCHITECTURES.includes(architecture.label as AllowedArchitecture),
    )
    .map(
      (architecture) =>
        ({ displayName: architecture.name, descriptor: architecture.label }) as Architecture,
    );

  return { osVersions: osVersionsList, architectures: architecturesList };
};
