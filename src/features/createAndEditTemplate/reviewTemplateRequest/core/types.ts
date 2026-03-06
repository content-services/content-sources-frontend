import {
  AllowedArchitecture,
  AllowedOSVersion,
  TemplateTitle,
} from 'features/createAndEditTemplate/shared/types/types';

type RepositoryUUIDsArrayLength = number;

// template review
type Content = {
  Architecture: AllowedArchitecture;
  'OS version': `el${AllowedOSVersion}`;
  'Number of Pre-selected Red Hat repositories': RepositoryUUIDsArrayLength;
  'Number of Additional Red Hat repositories': RepositoryUUIDsArrayLength;
  'Number of Custom or EPEL repositories': RepositoryUUIDsArrayLength;
};
type SnapshotLatest = { Snapshots: string };
type SnapshotWithDate = { 'Snapshots from': string };

type TemplateDescription = { Title: TemplateTitle; Detail: string };

export type TemplateReview = {
  Content: Content;
  'Repository Version': SnapshotWithDate | SnapshotLatest;
  'Template Description': TemplateDescription;
};

export type TemplateReviewKey = keyof TemplateReview;
