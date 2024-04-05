import axios from 'axios';
import { objectToUrlParams } from '../../helpers';

export interface ContentItem {
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
  last_snapshot?: SnapshotItem;
  label?: string;
}

export interface PopularRepository {
  uuid: string;
  existing_name: string;
  suggested_name: string;
  url: string;
  distribution_versions: Array<string>;
  distribution_arch: string;
  gpg_key: string;
  metadata_verification: boolean;
}

export interface CreateContentRequestItem {
  name: string;
  url: string;
  distribution_versions?: Array<string>;
  distribution_arch?: string;
  gpg_key?: string;
  metadata_verification?: boolean;
  snapshot?: boolean;
  module_hotfixes?: boolean;
}

export interface ErrorItem {
  status: number;
  title?: string;
  detail?: string;
}

export interface ErrorResponse {
  errors: ErrorItem[];
}

export type CreateContentRequestResponse = ContentItem[] | ErrorResponse;

export type CreateContentRequest = Array<CreateContentRequestItem>;

export interface EditContentRequestItem {
  uuid: string;
  name: string;
  url: string;
  distribution_arch: string;
  distribution_versions: string[];
  gpg_key: string;
  metadata_verification: boolean;
  snapshot: boolean;
  module_hotfixes: boolean;
}

export type EditContentRequest = Array<EditContentRequestItem>;

export type ContentList = Array<ContentItem>;

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

export interface ContentListResponse {
  data: ContentList;
  links: Links;
  meta: Meta;
}

export interface PopularRepositoriesResponse {
  data: PopularRepository[];
  links: Links;
  meta: Meta;
}

export interface RepositoryParamsResponse {
  distribution_versions: Array<NameLabel>;
  distribution_arches: Array<NameLabel>;
}

export interface GpgKeyResponse {
  gpg_key: string;
}

export type NameLabel = {
  name: string;
  label: string;
};

export type FilterData = Partial<{
  searchQuery: string;
  versions: Array<string>;
  arches: Array<string>;
  statuses: Array<string>;
  uuids: Array<string>;
  urls: Array<string>;
  availableForArch: string;
  availableForVersion: string;
}>;

export type ValidateItem = {
  skipped: boolean;
  valid: boolean;
  error: string;
};

export interface ValidationUrl extends ValidateItem {
  http_code: number;
  metadata_present: boolean;
  metadata_signature_present: boolean;
}

export type ValidationResponse = {
  name?: ValidateItem;
  url?: ValidationUrl;
  distribution_versions?: ValidateItem;
  distribution_arch?: ValidateItem;
  gpg_key?: ValidateItem;
}[];

export interface PackageItem {
  arch: string;
  checksum: string;
  epoch: number;
  name: string;
  release: string;
  summary: string;
  uuid: string;
  version: string;
}

export type PackagesResponse = {
  data: PackageItem[];
  links: Links;
  meta: Meta;
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

export interface SnapshotItem {
  uuid: string;
  created_at: string;
  distribution_path: string;
  content_counts: ContentCounts;
  added_counts: ContentCounts;
  removed_counts: ContentCounts;
}


export type SnapshotByDateResponse = {
  data: SnapshotForDate[];
};

export type SnapshotForDate = {
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

export type SnapshotListResponse = {
  data: SnapshotItem[];
  links: Links;
  meta: Meta;
};

export type IntrospectRepositoryRequestItem = {
  uuid: string;
  reset_count?: boolean;
};

export const getPopularRepositories: (
  page: number,
  limit: number,
  filterData?: Partial<FilterData>,
  sortBy?: string,
) => Promise<PopularRepositoriesResponse> = async (page, limit, filterData, sortBy) => {
  const search = filterData?.searchQuery;
  const versionParam = filterData?.versions?.join(',');
  const archParam = filterData?.arches?.join(',');
  const { data } = await axios.get(
    `/api/content-sources/v1/popular_repositories/?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      version: versionParam,
      arch: archParam,
      sort_by: sortBy,
    })}`,
  );
  return data;
};
export enum ContentOrigin {
  'REDHAT' = 'red_hat',
  'EXTERNAL' = 'external',
  'ALL' = 'red_hat,external',
}

export const getContentList: (
  page: number,
  limit: number,
  filterData: FilterData,
  sortBy: string,
  contentOrigin: ContentOrigin,
) => Promise<ContentListResponse> = async (page, limit, filterData, sortBy, contentOrigin) => {
  const search = filterData.searchQuery;
  const versionParam = filterData.versions?.join(',');
  const archParam = filterData.arches?.join(',');
  const statusParam = filterData.statuses?.join(',');
  const urlParam = filterData.urls?.join(',');
  const uuidsParam = filterData.uuids?.join(',');
  const { data } = await axios.get(
    `/api/content-sources/v1/repositories/?${objectToUrlParams({
      origin: contentOrigin,
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      version: versionParam,
      status: statusParam,
      arch: archParam,
      sort_by: sortBy,
      uuid: uuidsParam,
      url: urlParam,
      available_for_arch: filterData.availableForArch,
      available_for_version: filterData.availableForVersion,
    })}`,
  );
  return data;
};

export const fetchContentItem: (uuid: string) => Promise<ContentItem> = async (uuid: string) => {
  const { data } = await axios.get(`/api/content-sources/v1/repositories/${uuid}`);
  return data;
};

export const deleteContentListItem: (uuid: string) => Promise<void> = async (uuid: string) => {
  const { data } = await axios.delete(`/api/content-sources/v1/repositories/${uuid}`);
  return data;
};

export const deleteContentListItems: (uuids: string[]) => Promise<void> = async (
  uuids: string[],
) => {
  const { data } = await axios.post('/api/content-sources/v1/repositories/bulk_delete/', { uuids });
  return data;
};

export const getSnapshotsByDate = async (
  uuids: string[],
  date: string,
): Promise<SnapshotByDateResponse> => {
  const { data } = await axios.post('/api/content-sources/v1/snapshots/for_date/', {
    repository_uuids: uuids,
    date,
  });
  return data;
};

export const AddContentListItems: (
  request: CreateContentRequest,
) => Promise<CreateContentRequestResponse> = async (request) => {
  const { data } = await axios.post('/api/content-sources/v1.0/repositories/bulk_create/', request);
  return data;
};

export const EditContentListItem: (request: EditContentRequestItem) => Promise<void> = async (
  request,
) => {
  const { data } = await axios.patch(
    `/api/content-sources/v1.0/repositories/${request.uuid}`,
    request,
  );
  return data;
};

export const getRepositoryParams: () => Promise<RepositoryParamsResponse> = async () => {
  const { data } = await axios.get('/api/content-sources/v1/repository_parameters/');
  return data;
};

export const validateContentListItems: (
  request: CreateContentRequest,
) => Promise<ValidationResponse> = async (request) => {
  const { data } = await axios.post(
    '/api/content-sources/v1.0/repository_parameters/validate/',
    request,
  );
  return data;
};

export const getGpgKey: (url: string) => Promise<GpgKeyResponse> = async (url: string) => {
  const { data } = await axios.post(
    '/api/content-sources/v1/repository_parameters/external_gpg_key/',
    { url },
  );
  return data;
};

export const getPackages: (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  sortBy: string,
) => Promise<PackagesResponse> = async (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  sortBy: string,
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1.0/repositories/${uuid}/rpms?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      sort_by: sortBy,
    })}`,
  );
  return data;
};

export const getSnapshotList: (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  sortBy: string,
) => Promise<SnapshotListResponse> = async (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  sortBy: string,
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1.0/repositories/${uuid}/snapshots/?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      sortBy,
    })}`,
  );
  return data;
};

export const introspectRepository: (
  request: IntrospectRepositoryRequestItem,
) => Promise<void> = async (request) => {
  const { data } = await axios.post(
    `/api/content-sources/v1/repositories/${request.uuid}/introspect/`,
    { reset_count: request.reset_count },
  );
  return data;
};

export const triggerSnapshot: (repositoryUUID: string) => Promise<void> = async (
  repositoryUUID,
) => {
  const { data } = await axios.post(
    `/api/content-sources/v1.0/repositories/${repositoryUUID}/snapshot/`,
    {},
  );
  return data;
};

export const getRepoConfigFile: (snapshot_uuid: string) => Promise<string> = async (
  snapshot_uuid,
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/snapshots/${snapshot_uuid}/config.repo`,
  );
  return data;
};

export const getSnapshotPackages: (
  snap_uuid: string,
  page: number,
  limit: number,
  searchQuery: string,
) => Promise<PackagesResponse> = async (
  snap_uuid: string,
  page: number,
  limit: number,
  searchQuery: string,
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/snapshots/${snap_uuid}/rpms?offset=${
      (page - 1) * limit
    }&limit=${limit}&search=${searchQuery}`,
  );
  return data;
};
