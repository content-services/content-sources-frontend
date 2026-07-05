import { Button, Flex, Label, Title } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useMemo } from 'react';

import { RepositoryPackageReleaseInfo } from 'services/Content/ContentApi';
import { stripLightwellVersionSuffix } from '../../helpers';

type PackageReleasesTabProps = {
  version: string;
  builds: RepositoryPackageReleaseInfo[];
  allVersions: string[];
  latestReleases: RepositoryPackageReleaseInfo[];
  onVersionSelect: (version: string) => void;
};

const PackageReleasesTab = ({
  version,
  builds,
  allVersions,
  latestReleases,
  onVersionSelect,
}: PackageReleasesTabProps) => {
  const otherVersions = allVersions.filter((v) => v !== version);

  const releaseMap = useMemo(() => {
    const map: Record<string, RepositoryPackageReleaseInfo> = {};
    latestReleases.forEach((r) => {
      if (r.release) map[r.version] = r;
    });
    return map;
  }, [latestReleases]);

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      <Title headingLevel='h3' size='md'>
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
                <Label
                  isCompact
                  icon={<CopyIcon />}
                  onClick={() => navigator.clipboard.writeText(build.version)}
                  aria-label={`Copy ${build.version}`}
                  style={{ cursor: 'pointer' }}
                >
                  {build.version}
                </Label>
              </Td>
              <Td dataLabel='Date'>{build.created_at?.split('T')[0] ?? '—'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {otherVersions.length > 0 && (
        <>
          <Title headingLevel='h3' size='md'>
            Other available versions
          </Title>
          <Table aria-label='Other versions' variant={TableVariant.compact}>
            <Thead>
              <Tr>
                <Th>Version</Th>
                <Th>Latest release</Th>
                <Th>Releases</Th>
                <Th width={15}>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {otherVersions.map((v) => {
                const release = releaseMap[v];
                const fullRelease = release?.release ?? '—';
                const date = release?.created_at?.split('T')[0] ?? '—';
                return (
                  <Tr key={v}>
                    <Td dataLabel='Version'>
                      <Button variant='link' isInline onClick={() => onVersionSelect(v)}>
                        {stripLightwellVersionSuffix(v)}
                      </Button>
                    </Td>
                    <Td dataLabel='Latest release'>
                      {release ? (
                        <Label
                          isCompact
                          icon={<CopyIcon />}
                          onClick={() => navigator.clipboard.writeText(fullRelease)}
                          aria-label={`Copy ${fullRelease}`}
                          style={{ cursor: 'pointer' }}
                        >
                          {fullRelease}
                        </Label>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td dataLabel='Releases'>{release ? 1 : 0}</Td>
                    <Td dataLabel='Date'>{date}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}
    </Flex>
  );
};

export default PackageReleasesTab;
