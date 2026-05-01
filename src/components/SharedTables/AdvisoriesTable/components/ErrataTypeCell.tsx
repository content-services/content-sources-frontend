import { Flex, FlexItem } from '@patternfly/react-core';
import {
  BugIcon,
  EnhancementIcon,
  PackageIcon,
  SecurityIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

import { useMemo } from 'react';

const iconByType: Record<string, typeof BugIcon> = {
  bugfix: BugIcon,
  newpackage: PackageIcon,
  enhancement: EnhancementIcon,
  security: SecurityIcon,
};

const formatToDisplayName = (type: string) =>
  type?.toLowerCase() === 'newpackage'
    ? 'New package'
    : type?.charAt(0).toUpperCase() + type?.slice(1);

interface Props {
  type: string;
}

export default function ErrataTypeCell({ type }: Props) {
  const Icon = useMemo(() => iconByType[type?.toLowerCase()] ?? UnknownIcon, [type]);

  return (
    <Flex gap={{ default: 'gapSm' }}>
      <FlexItem>
        <Icon />
      </FlexItem>
      <FlexItem>{formatToDisplayName(type)}</FlexItem>
    </Flex>
  );
}
