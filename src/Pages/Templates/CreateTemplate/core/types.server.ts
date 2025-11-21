export type TemplateServer = {
  uuid: string;
  name: string;
  org_id: string;
  description: string;
  repository_uuids: string[];
  snapshots: SnapshotServer[];
  to_be_deleted_snapshots: SnapshotServer[];
  arch: string;
  version: string;
  date: string;
  use_latest: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_updated_by: string;
  last_update_task_uuid?: string;
  last_update_task?: AdminTaskServer;
  last_update_snapshot_error: string;
  rhsm_environment_created: boolean;
};

export type SnapshotServer = {
  uuid: string;
  created_at: string;
  distribution_path: string;
  content_counts: RepositoryCounts;
  added_counts: RepositoryCounts;
  removed_counts: RepositoryCounts;
  repository_name: string;
  repository_uuid: string;
};

type RepositoryCounts = {
  'rpm.advisory'?: number;
  'rpm.package'?: number;
  'rpm.packagecategory'?: number;
  'rpm.packageenvironment'?: number;
  'rpm.packagegroup'?: number;
  'rpm.modulemd'?: number;
  'rpm.modulemd_defaults'?: number;
  'rpm.repo_metadata_file'?: number;
};

export type AdminTaskServer = {
  uuid: string;
  account_id?: string;
  org_id: string;
  typename: string;
  status: 'running' | 'failed' | 'completed' | 'canceled' | 'pending';
  queued_at: string;
  started_at: string;
  finished_at: string;
  error: string;
  payload?: Record<string, unknown>;
  pulp?: PulpDataServer;
};

type PulpDataServer = {
  sync?: Record<string, unknown>;
  publication?: Record<string, unknown>;
  distribution?: Record<string, unknown>;
};
