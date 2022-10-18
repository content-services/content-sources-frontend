import {
  EmptyStateBody,
  EmptyState,
  EmptyStateVariant,
  Title,
  EmptyStateIcon,
  Button,
  Bullseye,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons';
import { Td, Tr } from '@patternfly/react-table';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  emptyStateContainer: {
    display: 'flex',
    flexGrow: 1,
    margin: 'auto',
  },
});

interface Props {
  clearSearch: () => void;
}

export default function EmptyPackageState({ clearSearch }: Props) {
  const classes = useStyles();
  return (
    <Tr>
      <Td colSpan={4}>
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.full} className={classes.emptyStateContainer}>
            <EmptyStateIcon icon={SearchIcon} />
            <Title headingLevel='h2' size='lg'>
              No packages match the search criteria
            </Title>
            <EmptyStateBody>Clear your current search to show more results</EmptyStateBody>
            <Button ouiaId='clear_filters' variant='link' onClick={clearSearch}>
              Clear search
            </Button>
          </EmptyState>
        </Bullseye>
      </Td>
    </Tr>
  );
}
