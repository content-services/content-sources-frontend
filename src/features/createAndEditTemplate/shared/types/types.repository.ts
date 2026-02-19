import { ContentOrigin } from 'services/Content/ContentApi';
import { RepositoryUUID } from './types';
import { AdminTask } from './types.template.full';
import { FullSnapshot } from './types.snapshot';

export interface RepositoryListServerResponse {
  data: FullRepository[];
  links: Links;
  meta: Meta;
}

export type RepositoryName = string;

export type FullRepository = {
  uuid: RepositoryUUID;
  name: RepositoryName;
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
  last_snapshot?: FullSnapshot;
  label?: string;
  origin?: ContentOrigin; // enums are treated as immutable types, therefore falling back outside of features
  last_snapshot_task?: AdminTask;
  last_introspection_status: string;
};

export type Links = {
  first: string;
  last: string;
  next?: string;
  prev?: string;
};

export type RepositoryCount = number;

export type Meta = {
  count: RepositoryCount;
  limit: number;
  offset: number;
};
