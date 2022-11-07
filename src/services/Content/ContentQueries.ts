import { AlertVariant } from '@patternfly/react-core';
import { QueryClient, useMutation, useQuery } from 'react-query';

import { useNotification } from './../Notifications/Notifications';
import {
  ContentListResponse,
  deleteContentListItem,
  getContentList,
  RepositoryParamsResponse,
  getRepositoryParams,
  AddContentListItems,
  CreateContentRequest,
  FilterData,
  validateContentListItems,
  EditContentListItem,
  EditContentRequest,
  getGpgKey,
  PackagesResponse,
  getPackages,
  ErrorResponse,
} from './ContentApi';

export const CONTENT_LIST_KEY = 'CONTENT_LIST_KEY';
export const REPOSITORY_PARAMS_KEY = 'REPOSITORY_PARAMS_KEY';
export const CREATE_PARAMS_KEY = 'CREATE_PARAMS_KEY';
export const PACKAGES_KEY = 'PACKAGES_KEY';

export const useContentListQuery = (
  page: number,
  limit: number,
  filterData: FilterData,
  sortBy: string,
) =>
  useQuery<ContentListResponse>(
    [CONTENT_LIST_KEY, page, limit, sortBy, ...Object.values(filterData)],
    () => getContentList(page, limit, filterData, sortBy),
    {
      keepPreviousData: true,
      staleTime: 20000,
      optimisticResults: true,
    },
  );

export const useAddContentQuery = (queryClient: QueryClient, request: CreateContentRequest) => {
  const { notify } = useNotification();
  return useMutation(() => AddContentListItems(request), {
    onSuccess: () => {
      const title =
        request?.length > 1
          ? `${request?.length} custom repositories added`
          : `Custom repository "${request?.[0]?.name}" added`;
      notify({
        variant: AlertVariant.success,
        title,
        description: 'Repository introspection may take some time',
      });
      queryClient.invalidateQueries(CONTENT_LIST_KEY);
    },
    onError: (err: { response?: { data: ErrorResponse } }) => {
      let description = 'An error occurred';

      switch (typeof err?.response?.data) {
        case 'string':
          description = err?.response?.data;
          break;
        case 'object':
          // Only show the first error
          err?.response?.data.errors?.find(({ detail }) => {
            if (detail) {
              description = detail;
              return true;
            }
          })?.detail;
          break;
        default:
          break;
      }

      notify({
        variant: AlertVariant.danger,
        title: 'Error adding items to content list',
        description,
      });
    },
  });
};

export const useEditContentQuery = (queryClient: QueryClient, request: EditContentRequest) => {
  const { notify } = useNotification();
  return useMutation(() => EditContentListItem(request[0]), {
    onSuccess: () => {
      notify({
        variant: AlertVariant.success,
        title: `Successfully edited ${request.length} ${request.length > 1 ? 'items' : 'item'}`,
      });
      queryClient.invalidateQueries(CONTENT_LIST_KEY);
    },
    onError: (err: { response?: { data: ErrorResponse } }) => {
      let description = 'An error occurred';

      switch (typeof err?.response?.data) {
        case 'string':
          description = err?.response?.data;
          break;
        case 'object':
          // Only show the first error
          err?.response?.data.errors?.find(({ detail }) => {
            if (detail) {
              description = detail;
              return true;
            }
          })?.detail;
          break;
        default:
          break;
      }

      notify({
        variant: AlertVariant.danger,
        title: 'Error editing items on content list',
        description,
      });
    },
  });
};

export const useValidateContentList = () => {
  const { notify } = useNotification();
  return useMutation((request: CreateContentRequest) => validateContentListItems(request), {
    onError: (err) => {
      const error = err as Error; // Forced Type
      notify({
        variant: AlertVariant.danger,
        title: 'Error validating form fields',
        description: error?.message,
      });
    },
  });
};

export const useDeleteContentItemMutate = (
  queryClient: QueryClient,
  page: number,
  perPage: number,
  filterData: FilterData,
  sortString: string,
) => {
  const contentListKeyArray = [
    CONTENT_LIST_KEY,
    page,
    perPage,
    ...Object.values(filterData),
    sortString,
  ];
  const { notify } = useNotification();
  return useMutation(deleteContentListItem, {
    onMutate: async (uuid: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(contentListKeyArray);
      // Snapshot the previous value
      const previousData: Partial<ContentListResponse> =
        queryClient.getQueryData(contentListKeyArray) || {};

      // Optimistically update to the new value
      queryClient.setQueryData(contentListKeyArray, () => ({
        ...previousData,
        data: previousData.data?.filter((data) => uuid !== data.uuid),
        meta: previousData.meta
          ? {
              ...previousData.meta,
              count: previousData.meta.count ? previousData.meta.count - 1 : 1,
            }
          : undefined,
      }));
      // Return a context object with the snapshotted value
      return { previousData, queryClient };
    },
    onSuccess: (_data, _variables, context) => {
      // Update all of the existing calls "count" to prevent number jumping on pagination
      const { previousData } = context as {
        previousData: ContentListResponse;
      };
      queryClient.setQueriesData(CONTENT_LIST_KEY, (data: Partial<ContentListResponse> = {}) => {
        if (data?.meta?.count) {
          data.meta.count = previousData?.meta?.count - 1;
        }

        return data;
      });
      queryClient.invalidateQueries(CONTENT_LIST_KEY);
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, _newData, context) => {
      if (context) {
        const { previousData } = context as {
          previousData: ContentListResponse;
        };
        queryClient.setQueryData(contentListKeyArray, previousData);
        const error = err as Error; // Forced Type
        notify({
          variant: AlertVariant.danger,
          title: 'Error deleting item from content list',
          description: error?.message,
        });
      }
    },
  });
};

export const useRepositoryParams = () =>
  useQuery<RepositoryParamsResponse>(REPOSITORY_PARAMS_KEY, getRepositoryParams, {
    keepPreviousData: true,
    staleTime: Infinity,
  });

export const useFetchGpgKey = () => {
  const { notify } = useNotification();

  const fetchGpgKey = async (url: string): Promise<string> => {
    let gpg_key = url;
    try {
      const data = await getGpgKey(url);
      gpg_key = data.gpg_key;
    } catch ({ response = {} }) {
      const { data } = response as { data: { message: string | undefined } | string };
      const description = typeof data === 'string' ? data : data?.message;
      notify({
        variant: AlertVariant.danger,
        title: 'Error fetching GPG key from provided URL',
        description,
      });
    }
    return gpg_key;
  };

  return { fetchGpgKey };
};

export const useGetPackagesQuery = (
  uuid: string,
  count: number,
  page: number,
  limit: number,
  searchQuery: string,
  sortBy: string,
) =>
  useQuery<PackagesResponse>(
    [PACKAGES_KEY, uuid, page, limit, searchQuery, sortBy, count],
    () => getPackages(uuid, page, limit, searchQuery, sortBy),
    {
      keepPreviousData: true,
      optimisticResults: true,
      staleTime: 60000,
      onError: (err) => {
        const { notify } = useNotification();
        const error = err as Error; // Forced Type
        notify({
          variant: AlertVariant.danger,
          title: 'Error fetching rpm packages',
          description: error?.message,
        });
      },
    },
  );
