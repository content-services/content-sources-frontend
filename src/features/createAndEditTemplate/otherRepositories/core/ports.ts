import { OtherUUID } from 'features/createAndEditTemplate/shared/types/types';
import { OtherReposQueryResponse, ParamsToGetOtherRepos } from './types';

// ports input
export type ToggleSelectedOtherRepository = (uuid: OtherUUID) => void;
export type RefreshRepositories = () => void;
// display other repositories

// ports output
export type GetOtherRepositories = (params: ParamsToGetOtherRepos) => OtherReposQueryResponse;
// read from top level store -  otherUUIDs
// set data in top level store - setOtherUUIDs
