import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Title,
  EmptyStateIcon,
  Button,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons';
import { createUseStyles } from 'react-jss';

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
  clearFilters: () => void;
}

const EmptyTableState = ({ clearFilters }: Props) => {
  const classes = useStyles();
  return (
    <EmptyState variant={EmptyStateVariant.full} className={classes.emptyStateContainer}>
      <EmptyStateIcon icon={SearchIcon} />
      <Title headingLevel='h2' size='lg'>
        No popular repositories match the filter criteria
      </Title>
      <EmptyStateBody className={classes.emptStateBody}>
        Clear all filters to show more results
      </EmptyStateBody>
      <Button ouiaId='clear_filters' variant='link' onClick={clearFilters}>
        Clear search filter
      </Button>
    </EmptyState>
  );
};

export default EmptyTableState;
