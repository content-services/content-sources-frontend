import { AdditionalUUID } from 'features/createAndEditTemplate/shared/types/types';
import { ParamsToGetRedhatRepos, RedhatReposQueryResponse } from './types';

// ports input
export type ToggleSelectedAdditionalRepository = (uuid: AdditionalUUID) => void;
// display redhat repositories

// ports output
export type GetRedhatRepositories = (params: ParamsToGetRedhatRepos) => RedhatReposQueryResponse;
// read from top level store - hardcodedUUIDs, additionalUUIDs
// set data in top level store - setAdditionalUUIDs
