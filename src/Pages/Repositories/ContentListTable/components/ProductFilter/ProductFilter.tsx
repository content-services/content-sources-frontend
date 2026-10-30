import DataViewTypeaheadCheckboxFilter, {
  DataViewTypeaheadCheckboxFilterProps,
} from 'components/DataViewTypeaheadCheckboxFilter/DataViewTypeaheadCheckboxFilter';
import { useAppContext } from 'middleware/AppContext';
import { ContentOrigin } from 'services/Content/ContentApi';

const ProductFilter = (props: DataViewTypeaheadCheckboxFilterProps) => {
  const { contentOrigin } = useAppContext();
  const isRedHatOriginAvailable =
    contentOrigin.length === 0 || contentOrigin.includes(ContentOrigin.REDHAT);

  return (
    <DataViewTypeaheadCheckboxFilter
      {...props}
      isDisabled={props.isDisabled || !isRedHatOriginAvailable}
    />
  );
};

export default ProductFilter;
