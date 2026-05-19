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

/**
 * Response from GET `/ids/templates/{id}/systems`.
 * Patch returns JSON:API `data` resources with `id` (see test-utils `resolvePatchSystemIdsForHostname`);
 * some responses may instead expose a plain `ids` array.
 */
export interface PatchTemplateSystemsIdsResponse {
  ids?: string[];
  data?: Array<{ id?: string; inventory_id?: string }>;
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

/** POST `/systems` pagination: only page > 1 sends a non-zero offset. */
const isRecoverableTemplateSystemsPaginationError = (err: unknown, page: number): boolean =>
  page > 1 && isInvalidOffsetPatchAxiosError(err);

/** Map POST /systems JSON:API rows to the shape used by the template systems table (`inventory_id`). */
const systemsCollectionToTemplateSystemsShape = (
  response: SystemsCollectionResponse,
): IDSystemsCollectionResponse => ({
  data: response.data.map((item) => ({
    inventory_id: item.id,
    type: item.type,
    attributes: {
      display_name: item.attributes.display_name,
      os: item.attributes.os,
      rhsm: item.attributes.rhsm,
      installable_rhsa_count: item.attributes.installable_rhsa_count,
      installable_rhba_count: item.attributes.installable_rhba_count,
      installable_rhea_count: item.attributes.installable_rhea_count,
      installable_other_count: item.attributes.installable_other_count,
      applicable_rhsa_count: item.attributes.applicable_rhsa_count,
      applicable_rhba_count: item.attributes.applicable_rhba_count,
      applicable_rhea_count: item.attributes.applicable_rhea_count,
      applicable_other_count: item.attributes.applicable_other_count,
      tags: item.attributes.tags,
      groups: item.attributes.groups,
      last_upload: item.attributes.last_upload,
    },
  })),
  links: response.links,
  meta: response.meta,
});

const TEMPLATE_SYSTEMS_IDS_PAGE_SIZE = 100;
/**
 * If every page were full, stop after this many systems worth of ID pages (API misbehavior guard).
 * Tune with `MAX_TEMPLATE_SYSTEMS_IDS_FETCH`; must stay in sync with Patch pagination limits.
 */
const MAX_TEMPLATE_SYSTEMS_IDS_FETCH = 500_000;
const MAX_TEMPLATE_SYSTEM_IDS_PAGES = Math.ceil(
  MAX_TEMPLATE_SYSTEMS_IDS_FETCH / TEMPLATE_SYSTEMS_IDS_PAGE_SIZE,
);

/** Normalize one page from GET `/ids/templates/.../systems` into inventory id strings. */
const inventoryIdsFromTemplateSystemsIdsBody = (
  body: PatchTemplateSystemsIdsResponse,
): string[] => {
  if (Array.isArray(body.data) && body.data.length > 0) {
    return body.data
      .map((row) => row.id ?? row.inventory_id ?? '')
      .filter((id): id is string => id.length > 0);
  }
  if (Array.isArray(body.ids) && body.ids.length > 0) {
    return body.ids.filter((id) => id.length > 0);
  }
  return [];
};

/** Paginates GET `/ids/templates/{template_id}/systems` until all inventory IDs are collected. */
export const fetchAllTemplateSystemsInventoryIds = async (
  templateId: string,
): Promise<string[]> => {
  const all: string[] = [];
  let offset = 0;
  let pagesFetched = 0;

  while (true) {
    if (
      pagesFetched >= MAX_TEMPLATE_SYSTEM_IDS_PAGES ||
      all.length >= MAX_TEMPLATE_SYSTEMS_IDS_FETCH
    ) {
      throw new Error(
        `Stopped fetching template system IDs (template ${templateId}) after reaching safety limits: pages=${pagesFetched}/${MAX_TEMPLATE_SYSTEM_IDS_PAGES}, ids=${all.length}/${MAX_TEMPLATE_SYSTEMS_IDS_FETCH}`,
      );
    }
    pagesFetched += 1;

    try {
      const { data } = await axios.get<PatchTemplateSystemsIdsResponse>(
        `${patchApiVersionUrl}/ids/templates/${templateId}/systems?${objectToUrlParams({
          offset: offset.toString(),
          limit: TEMPLATE_SYSTEMS_IDS_PAGE_SIZE.toString(),
        })}`,
      );
      const batch = inventoryIdsFromTemplateSystemsIdsBody(data);
      all.push(...batch);

      if (all.length >= MAX_TEMPLATE_SYSTEMS_IDS_FETCH) {
        throw new Error(
          `Stopped fetching template system IDs (template ${templateId}) after reaching safety limits: pages=${pagesFetched}/${MAX_TEMPLATE_SYSTEM_IDS_PAGES}, ids=${all.length}/${MAX_TEMPLATE_SYSTEMS_IDS_FETCH}`,
        );
      }

      if (batch.length < TEMPLATE_SYSTEMS_IDS_PAGE_SIZE) {
        return all;
      }

      offset += TEMPLATE_SYSTEMS_IDS_PAGE_SIZE;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // 404 on the first page means no systems for this template. Later 404 keeps already fetched IDs.
        return offset === 0 ? [] : all;
      }
      // List can shrink while paging (e.g. unassign); invalid offset on a later chunk is end-of-list.
      if (offset > 0 && isInvalidOffsetPatchAxiosError(err)) {
        return all;
      }
      throw err;
    }
  }
};

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

/**
 * Lists systems for a template via POST `/systems` with inventory UUIDs in the JSON body.
 * Call `fetchAllTemplateSystemsInventoryIds` first to obtain `inventoryIds`.
 */
export const listSystemsByTemplateId: (
  inventoryIds: string[],
  page: number,
  limit: number,
  search: string,
  sortBy?: string,
) => Promise<IDSystemsCollectionResponse> = async (inventoryIds, page, limit, search, sortBy) => {
  if (inventoryIds.length === 0) {
    return emptyTemplateSystemsResponse(limit, (page - 1) * limit);
  }

  const templateSystemsQuery = (pageNum: number) =>
    objectToUrlParams({
      offset: ((pageNum - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      sort: sortBy,
      [encodeURI('filter[stale]')]: encodeURI('in:true,false'),
    });

  const requestPage = async (pageNum: number) => {
    const { data } = await axios.post<SystemsCollectionResponse>(
      `${patchApiVersionUrl}/systems?${templateSystemsQuery(pageNum)}`,
      { ids: inventoryIds },
    );
    return systemsCollectionToTemplateSystemsShape(data);
  };

  const load = async (pageNum: number): Promise<IDSystemsCollectionResponse> => {
    try {
      return await requestPage(pageNum);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return emptyTemplateSystemsResponse(limit, (pageNum - 1) * limit);
      }
      throw err;
    }
  };

  try {
    return await load(page);
  } catch (err) {
    // After bulk unassign, the UI can still be on a page whose offset is past the new total;
    // the API responds with 400 Invalid offset. Recover using a valid page.
    if (isRecoverableTemplateSystemsPaginationError(err, page)) {
      const firstPage = await load(1);
      const total = firstPage.meta?.total_items ?? 0;
      const maxPage = Math.max(1, Math.ceil(total / limit));
      const targetPage = Math.min(page, maxPage);
      if (targetPage <= 1) {
        return firstPage;
      }
      return load(targetPage);
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
