import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Icon } from '@patternfly/react-core';
import {
  t_global_icon_color_severity_critical_default,
  t_global_icon_color_severity_important_default,
  t_global_icon_color_severity_minor_default,
  t_global_icon_color_severity_moderate_default,
} from '@patternfly/react-tokens';
import RhUiSeverityCriticalFillIcon from '@patternfly/react-icons/dist/esm/icons/rh-ui-severity-critical-fill-icon';
import RhUiSeverityImportantFillIcon from '@patternfly/react-icons/dist/esm/icons/rh-ui-severity-important-fill-icon';
import RhUiSeverityMinorFillIcon from '@patternfly/react-icons/dist/esm/icons/rh-ui-severity-minor-fill-icon';
import RhUiSeverityModerateFillIcon from '@patternfly/react-icons/dist/esm/icons/rh-ui-severity-moderate-fill-icon';

import type { CveCount, CveRange } from 'services/Lightwell/CoverageReportsApi';

// CVE severity keys match the backend's CveCount buckets, ordered most to least severe.
export type CveSeverity = keyof CveCount;

export type CveSeverityMeta = {
  key: CveSeverity;
  label: string;
  icon: ComponentType<{ style?: CSSProperties }>;
  color: string;
};

// Red Hat uses "Important"/"Moderate"/"Minor" severity icons; the CVE data uses
// "High"/"Medium"/"Low", so the labels and icons are mapped by position.
export const CVE_SEVERITIES: CveSeverityMeta[] = [
  {
    key: 'critical',
    label: 'Critical',
    icon: RhUiSeverityCriticalFillIcon,
    color: t_global_icon_color_severity_critical_default.var,
  },
  {
    key: 'high',
    label: 'High',
    icon: RhUiSeverityImportantFillIcon,
    color: t_global_icon_color_severity_important_default.var,
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: RhUiSeverityModerateFillIcon,
    color: t_global_icon_color_severity_moderate_default.var,
  },
  {
    key: 'low',
    label: 'Low',
    icon: RhUiSeverityMinorFillIcon,
    color: t_global_icon_color_severity_minor_default.var,
  },
];

export const renderCveSeverityIcon = (
  meta: CveSeverityMeta,
  size: 'sm' | 'md' = 'sm',
): ReactNode => {
  const SeverityIcon = meta.icon;
  return (
    <Icon size={size}>
      <SeverityIcon style={{ color: meta.color }} />
    </Icon>
  );
};

export const getTotalCveCount = (counts: CveCount): number =>
  CVE_SEVERITIES.reduce((total, { key }) => total + counts[key], 0);

// Renders the CVSS score window (e.g. "5.4–9.8"); an em dash when the package has no CVEs.
export const formatCvssRange = (range: CveRange | undefined): string =>
  range ? `${range.low.toFixed(1)}–${range.high.toFixed(1)}` : '—';
