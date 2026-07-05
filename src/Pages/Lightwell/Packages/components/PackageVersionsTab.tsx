import { Button, Flex, Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useMemo } from 'react';

import { RepositoryPackageReleaseInfo } from 'services/Content/ContentApi';

type PackageVersionsTabProps = {
  currentVersion: string;
  versions: string[];
  latestReleases: RepositoryPackageReleaseInfo[];
  onVersionSelect: (version: string) => void;
};

const PackageVersionsTab = ({
  currentVersion,
  versions,
  latestReleases,
  onVersionSelect,
}: PackageVersionsTabProps) => {
  const releaseDateMap = useMemo(() => {
    const map: Record<string, string> = {};
    latestReleases.forEach((r) => {
      map[r.version] = r.created_at?.split('T')[0] ?? '—';
    });
    return map;
  }, [latestReleases]);

  const otherVersions = versions.filter((v) => v !== currentVersion);

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      <Title headingLevel='h3' size='md'>
        Current version: {currentVersion}
      </Title>
      {otherVersions.length > 0 && (
        <>
          <Title headingLevel='h3' size='md'>
            Other available versions
          </Title>
          <Table aria-label='Other versions' variant={TableVariant.compact}>
            <Thead>
              <Tr>
                <Th>Version</Th>
                <Th width={15}>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {otherVersions.map((version) => (
                <Tr key={version}>
                  <Td dataLabel='Version'>
                    <Button variant='link' isInline onClick={() => onVersionSelect(version)}>
                      {version}
                    </Button>
                  </Td>
                  <Td dataLabel='Date'>{releaseDateMap[version] ?? '—'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Flex>
  );
};

export default PackageVersionsTab;
