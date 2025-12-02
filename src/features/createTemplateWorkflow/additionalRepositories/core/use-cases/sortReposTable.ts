import { createUseSortRepositoriesList } from '../../../shared/use-cases/useSortReposTable';
import { COLUMNS_TO_SORT } from '../domain/constants';

export const useSortRepositoriesList = createUseSortRepositoriesList(COLUMNS_TO_SORT);
