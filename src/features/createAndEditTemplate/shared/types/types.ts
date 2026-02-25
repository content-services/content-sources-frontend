export type Url = string;

// Architecture
export const ALLOWED_ARCHITECTURES = ['x86_64', 'aarch64'] as const;
export type AllowedArchitecture = (typeof ALLOWED_ARCHITECTURES)[number];

// OS Version
export const ALLOWED_OS_VERSIONS = ['8', '9', '10'] as const;
export type AllowedOSVersion = (typeof ALLOWED_OS_VERSIONS)[number];

// Selected Architecture & OSVersion
type ArchitectureVersionCode = `${AllowedArchitecture}-${AllowedOSVersion}`;
export type UrlsForArchitectureAndVersion = Record<
  ArchitectureVersionCode,
  HardcodedRepositoryUrls
>;
export type HardcodedRepositoryUrls = [Url, Url];
