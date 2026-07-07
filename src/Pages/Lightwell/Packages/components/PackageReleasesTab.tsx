import { Button, Flex, Label, Title, Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useMemo, useState } from 'react';

import { RepositoryPackageReleaseInfo } from 'services/Content/ContentApi';
import { stripLightwellVersionSuffix } from '../../helpers';

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
  const otherVersions = allVersions.filter((v) => stripLightwellVersionSuffix(v) !== version);
  const [copiedVersion, setCopiedVersion] = useState<string | null>(null);

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
          {builds.map((build) => {
            const copyText = formatCopyText(build.version);
            return (
              <Tr key={build.version}>
                <Td dataLabel='Release'>
                  {copiedVersion === build.version ? (
                    <Tooltip content='Copied' isVisible>
                      <Label isCompact isClickable icon={<CopyIcon />} aria-label={`Copy ${copyText}`}>
                        {build.version}
                      </Label>
                    </Tooltip>
                  ) : (
                    <Label
                      isCompact
                      isClickable
                      icon={<CopyIcon />}
                      onClick={() => {
                        navigator.clipboard.writeText(copyText);
                        setCopiedVersion(build.version);
                        setTimeout(() => setCopiedVersion(null), 2000);
                      }}
                      aria-label={`Copy ${copyText}`}
                    >
                      {build.version}
                    </Label>
                  )}
                </Td>
                <Td dataLabel='Date'>{build.created_at?.split('T')[0] ?? '—'}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {otherVersions.length > 0 ? (
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
                const release = releaseMap[v] ?? releaseMap[stripLightwellVersionSuffix(v)];
                const releaseVersion = release ? buildVersionFromRelease(release) : '';
                const copyText = release ? formatCopyText(releaseVersion) : '';
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
                        copiedVersion === releaseVersion ? (
                          <Tooltip content='Copied' isVisible>
                            <Label isCompact isClickable icon={<CopyIcon />} aria-label={`Copy ${copyText}`}>
                              {releaseVersion}
                            </Label>
                          </Tooltip>
                        ) : (
                          <Label
                            isCompact
                            isClickable
                            icon={<CopyIcon />}
                            onClick={() => {
                              navigator.clipboard.writeText(copyText);
                              setCopiedVersion(releaseVersion);
                              setTimeout(() => setCopiedVersion(null), 2000);
                            }}
                            aria-label={`Copy ${copyText}`}
                          >
                            {releaseVersion}
                          </Label>
                        )
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
      ) : null}
    </Flex>
  );
};

export default PackageReleasesTab;
