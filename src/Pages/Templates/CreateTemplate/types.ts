// // Base Types

// export type Selector<T> = () => T;

// export type FirstEmpty<T> = T | undefined;

// // type Nullable<T> = T | null;

// // =======================
// // =======================
// // INPUT PORTS

// // ADDITIONAL REPOSITORIES

// // --

// export type SelectRepositoryTypeLists = Selector<RepositoryTypesLists>;

// // ------

// // OTHER REPOSITORIES

// // get redhat repositories

// type ParamsToGetOtherRepos = {
//   arch: AllowedArchitecture;
//   version: AllowedOSVersion;
//   repoCategory: OtherRepository;
//   page: Page;
//   limit: PerPage;
//   sortedBy: SortDirection;
//   filterByName: FilterQuery;
//   filterSelected: FilterSelected;
// };
// type GetOtherRepositories = (params: ParamsToGetOtherRepos) => Promise<void>;

// // toggle checked
// type ToggleOtherRepository = (uuid: AdditionalUuid) => void;

// // filter selected
// // filter by name
// // turn page
// // set pagination
// // sort
// // refresh

// // ------

// // REPOSITORIES SNAPSHOTS

// // validate snapshots
// type ValidateSnapshots = (date: SnapshotDate, uuids: AllUuids) => Promise<void>;

// // toggle latest snapshot
// type ToggleLatestSnapshot = (snapshot: UseSnapshot) => void;

// // choose snapshot date
// type ChooseSnapshotDate = (date: SnapshotDate) => void;

// // ------

// // DESCRIBE TEMPLATE

// type ValidateTitle = (title: TemplateTitle) => void;
// type ValidateDetail = (title: TemplateDetail) => void;

// // ------

// // REVIEW TEMPLATE

// type TemplateReview = { Content: string };
// type CreateTemplateReview = () => TemplateReview;

// // ------

// // =======================
// // OUTPUT PORTS
