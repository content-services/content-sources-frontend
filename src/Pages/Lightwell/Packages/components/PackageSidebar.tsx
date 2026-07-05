import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type PackageSidebarProps = {
  lastUpdated: string;
  namespace: string;
  upstreamVersion: string;
  allVersions?: string[];
};

const PackageSidebar = ({
  lastUpdated,
  namespace,
  upstreamVersion,
  allVersions,
}: PackageSidebarProps) => (
  <Card isPlain>
    <CardBody>
      {/* TODO: Add License, Original author, and Project fields when package metadata becomes available from the API */}
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>Last updated</DescriptionListTerm>
          <DescriptionListDescription>{lastUpdated || '—'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Namespace</DescriptionListTerm>
          <DescriptionListDescription>{namespace || '—'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Rebuilt by</DescriptionListTerm>
          <DescriptionListDescription>Red Hat</DescriptionListDescription>
        </DescriptionListGroup>
        {allVersions && allVersions.length > 0 ? (
          <DescriptionListGroup>
            <DescriptionListTerm>Upstream versions</DescriptionListTerm>
            <DescriptionListDescription>{allVersions.join(', ')}</DescriptionListDescription>
          </DescriptionListGroup>
        ) : (
          <DescriptionListGroup>
            <DescriptionListTerm>Upstream version</DescriptionListTerm>
            <DescriptionListDescription>{upstreamVersion || '—'}</DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    </CardBody>
  </Card>
);

export default PackageSidebar;
