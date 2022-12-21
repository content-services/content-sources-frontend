import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Title,
  EmptyStateIcon,
  Button,
} from '@patternfly/react-core';
import { SearchIcon, PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons';
import { createUseStyles } from 'react-jss';
import AddContent from './AddContent/AddContent';

const useStyles = createUseStyles({
  emptyStateContainer: {
    display: 'flex',
    flexGrow: 1,
  },
  emptStateBody: {
    marginBottom: '16px',
  },
});

interface Props {
  notFiltered?: boolean;
  clearFilters: () => void;
}

const EmptyTableState = ({ notFiltered, clearFilters }: Props) => {
  const classes = useStyles();
  return (
    <EmptyState variant={EmptyStateVariant.full} className={classes.emptyStateContainer}>
      <EmptyStateIcon icon={notFiltered ? PlusCircleIcon : SearchIcon} />
      <Title headingLevel='h2' size='lg' ouiaId='empty_custom_title'>
        {notFiltered
          ? 'No custom repositories'
          : 'No custom repositories match the filter criteria'}
      </Title>
      <EmptyStateBody className={classes.emptStateBody}>
        {notFiltered
          ? 'To get started, create a custom repository'
          : 'Clear all filters to show more results'}
      </EmptyStateBody>
      {notFiltered ? (
        <AddContent />
      ) : (
        <Button ouiaId='clear_filters' variant='link' onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </EmptyState>
  );
};

export default EmptyTableState;
