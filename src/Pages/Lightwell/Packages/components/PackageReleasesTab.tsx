import { Button, Flex, Label, Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useMemo } from 'react';

import { RepositoryPackageReleaseInfo } from 'services/Content/ContentApi';
import { lightwellReleaseNum, stripLightwellVersionSuffix } from '../../helpers';
import CopyLabel from './CopyLabel';

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
      if (!r.release) return;
      const key = stripLightwellVersionSuffix(r.version);
      const existing = map[key];
      if (!existing || lightwellReleaseNum(r.release) > lightwellReleaseNum(existing.release)) {
        map[key] = r;
      }
    });
    return map;
  }, [latestReleases]);

  const uniqueVersions = useMemo(() => {
    const seen = new Set<string>();
    return allVersions.filter((v) => {
      const key = stripLightwellVersionSuffix(v);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allVersions]);

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
          {uniqueVersions.map((v) => {
            const stripped = stripLightwellVersionSuffix(v);
            const isSelected = stripped === version;
            const release = releaseMap[stripped];
            const releaseVersion = release ? buildVersionFromRelease(release) : '';
            const copyText = release ? formatCopyText(releaseVersion) : '';
            const date = release?.created_at?.split('T')[0] ?? '—';
            return (
              <Tr key={v}>
                <Td dataLabel='Version'>
                  {isSelected ? (
                    <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <span style={{ fontWeight: 'bold' }}>{stripped}</span>
                      <Label isCompact color='blue'>
                        Selected
                      </Label>
                    </Flex>
                  ) : (
                    <Button variant='link' isInline onClick={() => onVersionSelect(v)}>
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
