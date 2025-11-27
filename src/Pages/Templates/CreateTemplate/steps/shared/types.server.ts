import { AdminTaskServer, SnapshotServer } from '../../core/types.server';

export interface RepositoryListServerResponse {
  data: RepositoryOnServer[];
  links: Links;
  meta: Meta;
}

export type RepositoryOnServer = {
  uuid: string;
  name: string;
  package_count: number;
  url: string;
  distribution_versions: Array<string>;
  distribution_arch: string;
  account_id: string;
  org_id: string;
  status: string;
  last_introspection_error: string;
  last_introspection_time: string;
  failed_introspections_count: number;
  gpg_key: string;
  metadata_verification: boolean;
  snapshot: boolean;
  module_hotfixes: boolean;
  last_snapshot_uuid?: string;
  last_snapshot?: SnapshotServer;
  label?: string;
  origin?: RepositoryOrigin;
  last_snapshot_task?: AdminTaskServer;
  last_introspection_status: string;
};

export type Links = {
  first: string;
  last: string;
  next?: string;
  prev?: string;
};

export type Meta = {
  count: number;
  limit: number;
  offset: number;
};

export enum RepositoryOrigin {
  'REDHAT' = 'red_hat',
  'EXTERNAL' = 'external',
  'UPLOAD' = 'upload',
  'COMMUNITY' = 'community',
  'CUSTOM' = 'external,upload',
  'ALL' = 'red_hat,external,upload,community',
}
