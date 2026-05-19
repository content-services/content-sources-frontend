import { useParams } from 'react-router-dom';
import PackagesTableWithToolbars from 'components/SharedTables/PackagesTable';
import { useFetchTemplatePackages } from 'services/Templates/TemplateQueries';
import Loader from 'components/Loader';
import { usePackageTableFilters } from 'components/SharedTables/PackagesTable/usePackageTableFilters';
import { usePackageTablePagination } from 'components/SharedTables/PackagesTable/usePackageTablePagination';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const perPageKey = 'TemplatePackagePerPage';

export default function TemplatePackageTab() {
  const { templateUUID } = useParams();

  const filterData = usePackageTableFilters();
  const { debouncedSearch } = filterData;

  const paginationData = usePackageTablePagination({ perPageKey });
  const { page, perPage } = paginationData;

  const {
    isLoading,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useFetchTemplatePackages(page, perPage, debouncedSearch, templateUUID as string);

  const {
    data: packagesList = [],
    meta: { count = 0 },
  } = data;

  const paginationProps = {
    itemCount: count,
    ...paginationData,
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={spacing.pSm}>
      <PackagesTableWithToolbars
        packagesList={packagesList}
        isFetching={isFetching}
        isLoading={isLoading}
        paginationProps={paginationProps}
        count={count}
        filterProps={{ ...filterData }}
      />
    </div>
  );
}
