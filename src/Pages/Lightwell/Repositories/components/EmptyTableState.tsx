import { EmptyStateBody, EmptyState, EmptyStateVariant, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon, LockIcon } from '@patternfly/react-icons';
import { LIGHTWELL_PROJECT_URL } from 'Pages/Lightwell/constants';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  emptyStateContainer: {
    display: 'flex',
    flexGrow: 1,
  },
  emptyStateBody: {
    marginBottom: '16px',
    textWrap: 'wrap',
    maxWidth: '500px',
  },
});

const EmptyTableState = () => {
  const classes = useStyles();
  return (
    <EmptyState
      headingLevel='h2'
      icon={LockIcon}
      titleText='Lightwell members only'
      variant={EmptyStateVariant.full}
      className={classes.emptyStateContainer}
    >
      <EmptyStateBody className={classes.emptyStateBody}>
        <Button
          variant='link'
          component='a'
          href={LIGHTWELL_PROJECT_URL}
          icon={<ExternalLinkAltIcon />}
          iconPosition='end'
          target='_blank'
          rel='noopener noreferrer'
        >
          Not a member? Get started
        </Button>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default EmptyTableState;
