export const isMinorRelease = (rhsm: string) =>
  // Empty string means that the RHEL release version is unset and should be treated as a major release
  !['', '8', '8.0', '9', '9.0', '10', '10.0'].includes(rhsm);

export const TEMPLATE_SYSTEMS_UPDATE_LIMIT = 1000;
