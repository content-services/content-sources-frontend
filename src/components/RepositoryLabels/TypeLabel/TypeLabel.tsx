import { Label, Tooltip } from '@patternfly/react-core';
import {
  RedhatIcon,
  RhUiFoldersFillIcon,
  RhUiSyncIcon,
  RhUiUploadIcon,
} from '@patternfly/react-icons';
import { ReactNode } from 'react';

export type RepositoryType = 'redHat' | 'upload' | 'remote' | 'partner';

type RepositoryTypeItem = {
  label: string;
  icon: ReactNode;
  tooltip?: string;
};

const repositoryTypeItems: Record<RepositoryType, RepositoryTypeItem> = {
  redHat: { label: 'Red Hat', icon: <RedhatIcon /> },
  upload: {
    label: 'Upload',
    icon: <RhUiUploadIcon />,
    tooltip: 'New content uploads trigger a snapshot.',
  },
  remote: { label: 'Remote', icon: <RhUiSyncIcon /> },
  partner: {
    label: 'Partner',
    icon: <RhUiFoldersFillIcon />,
    tooltip: 'Provided by a partner organization.',
  },
};

type TypeLabelProps = {
  type: RepositoryType;
  label?: string;
  tooltip?: string;
  hideTooltip?: boolean;
  // Intended for external spacing only, the label itself looks the same everywhere
  className?: string;
};

const TypeLabel = ({ type, label, tooltip, hideTooltip, className }: TypeLabelProps) => {
  const item = repositoryTypeItems[type];
  const tooltipContent = tooltip ?? item.tooltip;

  const typeLabel = (
    <Label variant='outline' isCompact icon={item.icon} className={className}>
      {label ?? item.label}
    </Label>
  );

  return tooltipContent && !hideTooltip ? (
    <Tooltip content={tooltipContent}>{typeLabel}</Tooltip>
  ) : (
    typeLabel
  );
};

export default TypeLabel;
