import { useNavigate } from 'react-router-dom';

import { useLightwellRootPath } from './useLightwellRootPath';

// Build Lightwell paths under the /lightwell mount point
const buildLightwellNavigationPaths = (rootPath: string) => ({
  repositories: () => rootPath,
  repositoryPackages: (repoUUID: string) => `${rootPath}/${repoUUID}`,
  packageDetails: (repoUUID: string, packageName: string) =>
    `${rootPath}/${repoUUID}/${encodeURIComponent(packageName)}`,
});

export const useLightwellNavigate = () => {
  const navigate = useNavigate();
  const rootPath = useLightwellRootPath();
  const paths = buildLightwellNavigationPaths(rootPath);

  return {
    paths,
    goToRepositories: () => navigate(paths.repositories()),
    goToRepositoryPackages: (repoUUID: string) => navigate(paths.repositoryPackages(repoUUID)),
    goToPackageDetails: (repoUUID: string, packageName: string) =>
      navigate(paths.packageDetails(repoUUID, packageName)),
  };
};
