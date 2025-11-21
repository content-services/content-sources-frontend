import { createUseSortRepositoriesList } from '../../shared/useSortReposTable';

const COLUMNS_TO_SORT = ['name', 'status', 'package_count'];

export const useSortRepositoriesList = createUseSortRepositoriesList(COLUMNS_TO_SORT);
