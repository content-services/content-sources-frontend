import {
  FilterByName,
  FilterSelected,
  Paginate,
  ToggleAdditionalRepository,
  TurnPage,
} from '../core/ports';

export type AdditionalReposApiType = {
  turnPage: TurnPage;
  setPagination: Paginate;
  toggleChecked: ToggleAdditionalRepository;
  filterByName: FilterByName;
  filterSelected: FilterSelected;
  clearFilterByName: () => void;
};

export const initialAdditionalApi = {
  turnPage: () => {},
  setPagination: () => {},
  toggleChecked: () => {},
  filterByName: () => {},
  clearFilterByName: () => {},
  filterSelected: () => {},
};
