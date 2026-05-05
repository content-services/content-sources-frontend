import axios from 'axios';
import { objectToUrlParams } from 'helpers';
import type { Links } from 'services/Content/ContentApi';

export interface SystemAttributes {
  display_name: string;
  arch: string;
  os: string;
  rhsm: string;
  tags: string[];
  last_evaluation: string | null;
  rhsa_count: number;
  rhba_count: number;
  rhea_count: number;
  other_count: number;
  packages_installed: number;
  baseline_name: string;
  last_upload: string;
  stale_timestamp: string;
  stale_warning_timestamp: string;
  culled_timestamp: string;
  created: string;
  stale: boolean;
  satellite_managed: boolean;
  built_pkgcache: boolean;
  packages_installable: number;
  packages_applicable: number;
  installable_rhsa_count: number;
  installable_rhba_count: number;
  installable_rhea_count: number;
  installable_other_count: number;
  applicable_rhsa_count: number;
  applicable_rhba_count: number;
  applicable_rhea_count: number;
  applicable_other_count: number;
  baseline_id: number;
  template_name: string;
  template_uuid: string;
  groups: SystemGroup[];
}

export interface SystemItem {
  attributes: SystemAttributes;
  id: string;
  type: string;
}

export interface SystemGroup {
  id: string;
  name: string;
}

export interface IDSystemAttributes {
  display_name: string;
  os: string;
  rhsm: string;
  installable_rhsa_count: number;
  installable_rhba_count: number;
  installable_rhea_count: number;
  installable_other_count: number;
  applicable_rhsa_count: number;
  applicable_rhba_count: number;
  applicable_rhea_count: number;
  applicable_other_count: number;
  tags: string[];
  groups: SystemGroup[];
  last_upload: string;
}

export interface IDSystemItem {
  attributes: IDSystemAttributes;
  inventory_id: string;
  type: string;
}

export type SystemMeta = {
  limit: number;
  offset: number;
  has_systems: boolean;
  subtotals: { patched: number; stale: number; unpatched: number };
  total_items: number;
};

export interface SystemsCollectionResponse {
  data: Array<SystemItem>;
  links: Links;
  meta: SystemMeta;
}

export interface IDSystemsCollectionResponse {
  data: Array<IDSystemItem>;
  links: Links;
  meta: SystemMeta;
}

export interface SystemsFilters {
  os?: string;
  osminor?: string;
  stale?: string;
  arch?: string;
  ids?: string[];
  tags?: string[];
}

export interface Tag {
  namespace: string;
  key: string;
  value: string;
}

export interface TagItem {
  count: number;
  tag: Tag;
}

export interface TagsResponse {
  data: Array<TagItem>;
  links: Links;
  meta: SystemMeta;
}

export interface PatchTemplateAttributes {
  name: string;
  published: string;
  systems: number;
}

export interface PatchTemplateItem {
  attributes: PatchTemplateAttributes;
  id: string;
  type: string;
}

export interface PatchTemplatesResponse {
  data: PatchTemplateItem[];
  links: Links;
  meta: SystemMeta;
}

const patchApiVersionUrl = '/api/patch/v3';

const emptyTemplateSystemsResponse = (limit: number, offset = 0): IDSystemsCollectionResponse => ({
  data: [],
  links: { first: '', last: '' },
  meta: {
    total_items: 0,
    limit,
    offset,
    has_systems: false,
    subtotals: { patched: 0, stale: 0, unpatched: 0 },
  },
});

/** Patch 400 when offset is past the list (JSON:API errors or legacy `{ error: string }`). */
const isInvalidOffsetPatchAxiosError = (err: unknown): boolean => {
  if (!axios.isAxiosError(err) || err.response?.status !== 400) {
    return false;
  }

  const data = err.response.data as
    | {
        error?: string;
        errors?: Array<{ code?: string; source?: { pointer?: string; parameter?: string } }>;
      }
    | undefined;

  const firstError = data?.errors?.[0];
  // Backend currently returns { error: "Invalid offset" } for this case.
  const isLegacyInvalidOffsetMessage = data?.error === 'Invalid offset';
  const isInvalidOffsetCode = firstError?.code === 'INVALID_OFFSET';
  const isOffsetParameter =
    firstError?.source?.parameter === 'offset' || firstError?.source?.pointer === '/meta/offset';

  return Boolean(isLegacyInvalidOffsetMessage || isInvalidOffsetCode || isOffsetParameter);
};

/** Invalid offset on page > 1 after the list shrinks (e.g. bulk unassign). */
const isRecoverableTemplateSystemsPaginationError = (err: unknown, page: number): boolean =>
  page > 1 && isInvalidOffsetPatchAxiosError(err);

export const getSystemsList: (
  page: number,
  limit: number,
  search: string,
  filter: SystemsFilters,
  sortBy?: string,
) => Promise<SystemsCollectionResponse> = async (page, limit, search, filter, sortBy) => {
  const queryString = objectToUrlParams({
    page: page.toString(),
    limit: limit?.toString(),
    offset: ((page - 1) * limit).toString(),
    sort: sortBy,
    search,
    tags: filter.tags?.map((tag) => encodeURIComponent(tag)) || '',
    [encodeURI('filter[stale]')]: filter.stale
      ? encodeURI(`in:${filter.stale}`)
      : encodeURI('in:true,false'),
    [encodeURI('filter[osname]')]: 'RHEL', // Hardcoded for now
    [encodeURI('filter[osmajor]')]: filter.os,
    ...(filter.osminor ? { [encodeURI('filter[osminor]')]: filter.osminor } : {}),
    [encodeURI('filter[arch]')]: filter?.arch,
  });

  if (filter.ids?.length) {
    const { data } = await axios.post<SystemsCollectionResponse>(
      `${patchApiVersionUrl}/systems?${queryString}`,
      { ids: filter.ids },
    );
    return data;
  }

  const { data } = await axios.get<SystemsCollectionResponse>(
    `${patchApiVersionUrl}/systems?${queryString}`,
  );
  return data;
};

/** Lists systems assigned to a template via GET `/templates/{template_id}/systems`. */
export const listSystemsByTemplateId: (
  templateId: string,
  page: number,
  limit: number,
  search: string,
  sortBy?: string,
) => Promise<IDSystemsCollectionResponse> = async (templateId, page, limit, search, sortBy) => {
  const requestPage = async (pageNum: number): Promise<IDSystemsCollectionResponse> => {
    try {
      const { data } = await axios.get<IDSystemsCollectionResponse>(
        `${patchApiVersionUrl}/templates/${templateId}/systems?${objectToUrlParams({
          offset: ((pageNum - 1) * limit).toString(),
          limit: limit?.toString(),
          search,
          sort: sortBy,
        })}`,
      );
      return data;
    } catch (err) {
      // The Patch API returns 404 when no systems are assigned to the template
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return emptyTemplateSystemsResponse(limit, (pageNum - 1) * limit);
      }
      throw err;
    }
  };

  try {
    return await requestPage(page);
  } catch (err) {
    // After bulk unassign, the UI can still be on a page whose offset is past the new total
    if (isRecoverableTemplateSystemsPaginationError(err, page)) {
      const firstPage = await requestPage(1);
      const total = firstPage.meta?.total_items ?? 0;
      const maxPage = Math.max(1, Math.ceil(total / limit));
      const targetPage = Math.min(page, maxPage);
      if (targetPage <= 1) {
        return firstPage;
      }
      return requestPage(targetPage);
    }
    throw err;
  }
};

export const addTemplateToSystems: (
  templateId: string,
  systemUUIDs: string[],
) => Promise<SystemsCollectionResponse> = async (templateId, systemUUIDs) => {
  const { data } = await axios.put(`${patchApiVersionUrl}/templates/${templateId}/systems`, {
    systems: systemUUIDs,
  });
  return data;
};

export const deleteTemplateFromSystems: (systemUUIDs: string[]) => Promise<void> = async (
  systemUUIDs,
) => {
  const { data } = await axios.delete(`${patchApiVersionUrl}/templates/systems`, {
    data: { systems: systemUUIDs },
  });

  return data;
};

export const listTags: (
  page: number,
  limit: number,
  search?: string,
) => Promise<TagsResponse> = async (page: number = 1, limit: number = 10, search?: string) => {
  const { data } = await axios.get(
    `${patchApiVersionUrl}/tags?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
    })}`,
  );

  return data;
};

const PATCH_TEMPLATES_CHUNK_SIZE = 50;

export const getTemplateSystemCounts: (
  templateUuids: string[],
) => Promise<Record<string, number>> = async (templateUuids) => {
  if (templateUuids.length === 0) return {};

  // Strip hyphens from UUIDs to conserve characters, Patch API supports this
  const strippedUuids = templateUuids.map((uuid) => uuid.replace(/-/g, ''));

  // Chunk into groups of 50, to prevent hitting the URL length limit
  const chunks: string[][] = [];
  while (strippedUuids.length > 0) {
    chunks.push(strippedUuids.splice(0, PATCH_TEMPLATES_CHUNK_SIZE));
  }

  const responses = await Promise.all(
    chunks.map(async (chunk) => {
      const { data } = await axios.get<PatchTemplatesResponse>(
        `${patchApiVersionUrl}/templates?${objectToUrlParams({
          [encodeURI('filter[id]')]: encodeURI(`in:${chunk.join(',')}`),
          limit: chunk.length.toString(),
        })}`,
      );
      return data;
    }),
  );

  const systemCountMap: Record<string, number> = {};
  for (const response of responses) {
    for (const item of response.data) {
      systemCountMap[item.id] = item.attributes.systems;
    }
  }

  return systemCountMap;
};
