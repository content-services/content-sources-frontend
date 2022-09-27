import axios from 'axios';

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
}

export type CreateContentRequest = Array<CreateContentRequestItem>;

export interface EditContentRequestItem {
  uuid: string;
  name: string;
  url: string;
  distribution_arch: string;
  distribution_versions: string[];
  gpg_key: string;
  metadata_verification: boolean;
}

export type EditContentRequest = Array<EditContentRequestItem>;

export type ContentList = Array<ContentItem>;

export type Links = {
  first: string;
  last: string;
  next: string;
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

export interface RepositoryParamsResponse {
  distribution_versions: Array<NameLabel>;
  distribution_arches: Array<NameLabel>;
}

export type NameLabel = {
  name: string;
  label: string;
};

export type FilterData = {
  searchQuery: string;
  versions: Array<string>;
  arches: Array<string>;
};

export type ValidateItem = {
  skipped: boolean;
  valid: boolean;
  error: string;
};

export interface ValidationUrl extends ValidateItem {
  http_code: number;
  metadata_present: boolean;
}

export type ValidationResponse = {
  name?: ValidateItem;
  url?: ValidationUrl;
  distribution_versions?: ValidateItem;
  distribution_arch?: ValidateItem;
  gpgKey?: ValidateItem;
}[];

export const getContentList: (
  page: number,
  limit: number,
  filterData: FilterData,
  sortBy: string,
) => Promise<ContentListResponse> = async (page, limit, filterData, sortBy) => {
  const searchQuery = filterData.searchQuery;
  const versionParam = filterData.versions.join(',');
  const archParam = filterData.arches.join(',');
  const { data } = await axios.get(
    `/api/content-sources/v1/repositories/?offset=${
      (page - 1) * limit
    }&limit=${limit}&search=${searchQuery}&version=${versionParam}&arch=${archParam}&sort_by=${sortBy}`,
  );
  return data;
};

export const deleteContentListItem: (uuid: string) => Promise<void> = async (uuid: string) => {
  const { data } = await axios.delete(`/api/content-sources/v1/repositories/${uuid}`);
  return data;
};

export const AddContentListItems: (request: CreateContentRequest) => Promise<void> = async (
  request,
) => {
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
