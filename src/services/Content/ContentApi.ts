import axios from 'axios';

export interface ContentItem {
  uuid: string;
  name: string;
  url: string;
  distribution_versions: Array<string>;
  distribution_arch: string;
  account_id: string;
  org_id: string;
}

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

export interface ContentRepoParamsResponse {
  distribution_versions: Array<{ name: string, label:string }>;
  distribution_arches: Array<{ name: string, label:string }>;
}

export type filterData = {
  searchQuery: string;
  versions: Array<string>;
  arches: Array<string>;
}

export const getContentList: (page: number, limit: number, filterData: filterData) => Promise<ContentListResponse> = async (
  page,
  limit,
  filterData,
) => {

  const searchQuery = filterData.searchQuery;
  const versionParam = filterData.versions.join(',');
  const archParam = filterData.arches.join(',');
  const { data } = await axios.get(
    `/api/content_sources/v1/repositories/?offset=${(page - 1) * limit}&limit=${limit}&search=${searchQuery}&version=${versionParam}&arch=${archParam}`,
  );
  return data;
};

export const deleteContentListItem: (uuid: string) => Promise<void> = async (uuid: string) => {
  const { data } = await axios.delete(`/api/content_sources/v1/repositories/${uuid}`);
  return data;
};

export const getContentRepoParams: () => Promise<ContentRepoParamsResponse> = async () => {
  const { data } = await axios.get(
      '/api/content_sources/v1/repository_parameters/'
  );
  return data;
}
