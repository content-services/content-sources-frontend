import { createUseSortRepositoriesList } from 'features/createAndEditTemplate/shared/hooks/useSortReposTable';
import { COLUMNS_TO_SORT } from '../core/domain/constants';

export const useSortRepositoriesList = createUseSortRepositoriesList(COLUMNS_TO_SORT);
