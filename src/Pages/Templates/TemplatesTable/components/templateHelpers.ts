import * as Yup from 'yup';
import { NameLabel, DistributionMinorVersion } from 'services/Content/ContentApi';

export const EUS = 'RHEL-EUS-x86_64' as const;
export const E4S = 'RHEL-E4S-x86_64' as const;
export const EXTENDED_SUPPORT_FEATURES = [EUS, E4S] as const;
export const SUPPORTED_EUS_ARCHES = ['x86_64'];

const SUPPORTED_MAJOR_VERSIONS = ['8', '9', '10'];
const SUPPORTED_ARCHES = ['x86_64', 'aarch64'];
const STANDARD_STREAM = 'dist';
const MAJOR_RELEASE_VERSIONS = ['', '8', '8.0', '9', '9.0', '10', '10.0'];

type ExtendedRelease = 'eus' | 'e4s' | 'none';

/**
 * Converts a feature name to an extended release name.
 */
export const featureNameToExtendedRelease = (featureName: string | undefined): ExtendedRelease =>
  featureName === EUS ? 'eus' : featureName === E4S ? 'e4s' : 'none';

/**
 * Checks if the user has extended support features enabled.
 */
export const hasExtendedSupport = (extended_release_features?: NameLabel[]) =>
  !!extended_release_features?.length;

const validateRedHatRepoParams = (
  arch?: string,
  majorVersion?: string,
  featureName?: string,
  minorVersion?: string,
  distributionMinorVersions?: DistributionMinorVersion[],
): boolean => {
  if (!arch || !majorVersion) return false;
  if (!SUPPORTED_ARCHES.includes(arch)) return false;
  if (!SUPPORTED_MAJOR_VERSIONS.includes(majorVersion)) return false;

  // Standard stream is simple. If we pass basic checks, we are good to go
  if (!featureName) return true;

  // Extended stream (EUS/E4S)
  if (!minorVersion) return false;
  if (!SUPPORTED_EUS_ARCHES.includes(arch)) return false; // Extended support is x86_64 only

  const supportedVersion = distributionMinorVersions?.find(
    (version) => version.label === minorVersion && version.major === majorVersion,
  );
  if (!supportedVersion) return false;

  // Check if this specific version supports the requested feature
  return supportedVersion.feature_names.some((feature) => feature === featureName);
};

export const getRedHatCoreRepoUrls = (
  arch?: string,
  majorVersion?: string,
  featureName?: string,
  minorVersion?: string,
  distributionMinorVersions?: DistributionMinorVersion[],
): string[] | undefined => {
  const areParamsValid = validateRedHatRepoParams(
    arch,
    majorVersion,
    featureName,
    minorVersion,
    distributionMinorVersions,
  );
  if (!areParamsValid) return;

  const releaseStream = featureName ? featureNameToExtendedRelease(featureName) : STANDARD_STREAM;
  const versionNumber = releaseStream === STANDARD_STREAM ? majorVersion : minorVersion;

  return [
    `https://cdn.redhat.com/content/${releaseStream}/rhel${majorVersion}/${versionNumber}/${arch}/appstream/os`,
    `https://cdn.redhat.com/content/${releaseStream}/rhel${majorVersion}/${versionNumber}/${arch}/baseos/os`,
  ];
};

export const isMinorRelease = (rhsm: string) => !MAJOR_RELEASE_VERSIONS.includes(rhsm);

export const TemplateValidationSchema = Yup.object().shape({
  name: Yup.string().max(255, 'Too Long!').required('Required'),
  description: Yup.string().max(255, 'Too Long!'),
});

export const TEMPLATE_SYSTEMS_UPDATE_LIMIT = 1000;
