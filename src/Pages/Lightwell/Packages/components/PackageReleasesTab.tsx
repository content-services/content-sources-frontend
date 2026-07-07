import { Button, Flex, Label, Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useMemo } from 'react';

import { RepositoryPackageReleaseInfo } from 'services/Content/ContentApi';
import CopyLabel from './CopyLabel';
import { compareReleasesDesc, sortVersionsDesc, stripLightwellVersionSuffix } from '../../helpers';

type PackageReleasesTabProps = {
  version: string;
  builds: RepositoryPackageReleaseInfo[];
  allVersions: string[];
  latestReleases: RepositoryPackageReleaseInfo[];
  onVersionSelect: (version: string) => void;
  formatCopyText: (version: string) => string;
};

export const buildVersionFromRelease = (
  release: Pick<RepositoryPackageReleaseInfo, 'version' | 'release'>,
) =>
  release.version.includes('.rhlw-')
    ? release.version
    : `${stripLightwellVersionSuffix(release.version)}.${release.release}`;

const PackageReleasesTab = ({
  version,
  builds,
  allVersions,
  latestReleases,
  onVersionSelect,
  formatCopyText,
}: PackageReleasesTabProps) => {
  const releaseMap = useMemo(() => {
    const map: Record<string, RepositoryPackageReleaseInfo> = {};
    latestReleases.forEach((r) => {
      if (r.release) {
        map[stripLightwellVersionSuffix(r.version)] = r;
      }
    });
    return map;
  }, [latestReleases]);

  const sortedVersions = useMemo(() => {
    const sortedReleases = [...latestReleases].sort(compareReleasesDesc);

    if (sortedReleases.length > 0) {
      return sortedReleases.map((release) => stripLightwellVersionSuffix(release.version));
    }

    return sortVersionsDesc(allVersions.map(stripLightwellVersionSuffix));
  }, [allVersions, latestReleases]);

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      <Title headingLevel='h2' size='lg'>
        Releases for version {version}
      </Title>
      <Table aria-label={`Releases for ${version}`} variant={TableVariant.compact}>
        <Thead>
          <Tr>
            <Th>Release</Th>
            <Th width={15}>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {builds.map((build) => (
            <Tr key={build.version}>
              <Td dataLabel='Release'>
                <CopyLabel copyText={formatCopyText(build.version)}>{build.version}</CopyLabel>
              </Td>
              <Td dataLabel='Date'>{build.created_at?.split('T')[0] ?? '—'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Title headingLevel='h2' size='lg'>
        Available versions
      </Title>
      <Table aria-label='Available versions' variant={TableVariant.compact}>
        <Thead>
          <Tr>
            <Th>Version</Th>
            <Th>Latest release</Th>
            <Th>Releases</Th>
            <Th width={15}>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedVersions.map((stripped) => {
            const isSelected = stripped === version;
            const release = releaseMap[stripped];
            const releaseVersion = release ? buildVersionFromRelease(release) : '';
            const copyText = release ? formatCopyText(releaseVersion) : '';
            const date = release?.created_at?.split('T')[0] ?? '—';
            return (
              <Tr key={stripped}>
                <Td dataLabel='Version'>
                  {isSelected ? (
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <span style={{ fontWeight: 'bold' }}>{stripped}</span>
                      <Label isCompact color='blue'>
                        Selected
                      </Label>
                    </Flex>
                  ) : (
                    <Button variant='link' isInline onClick={() => onVersionSelect(stripped)}>
                      {stripped}
                    </Button>
                  )}
                </Td>
                <Td dataLabel='Latest release'>
                  {release ? <CopyLabel copyText={copyText}>{releaseVersion}</CopyLabel> : '—'}
                </Td>
                <Td dataLabel='Releases'>{release ? 1 : 0}</Td>
                <Td dataLabel='Date'>{date}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Flex>
  );
};

export default PackageReleasesTab;
