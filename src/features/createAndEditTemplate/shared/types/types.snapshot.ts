import { RepositoryUUID } from './types';

type SnapshotUUID = string;

export type FullSnapshot = {
  uuid: SnapshotUUID;
  created_at: string;
  distribution_path: string;
  content_counts: ContentCounts;
  added_counts: ContentCounts;
  removed_counts: ContentCounts;
  repository_name: string;
  repository_uuid: RepositoryUUID;
};

export type SnapshotUntilDate = {
  repository_uuid: string;
  is_after: boolean;
  match?: {
    uuid: string;
    created_at: string;
    repository_path: string;
    content_counts: ContentCounts;
    added_counts: ContentCounts;
    removed_counts: ContentCounts;
    url: string;
  };
};

export type ContentCounts = {
  'rpm.advisory'?: number;
  'rpm.package'?: number;
  'rpm.packagecategory'?: number;
  'rpm.packageenvironment'?: number;
  'rpm.packagegroup'?: number;
  'rpm.modulemd'?: number;
  'rpm.modulemd_defaults'?: number;
  'rpm.repo_metadata_file'?: number;
};
