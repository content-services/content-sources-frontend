import { Label, Tooltip } from '@patternfly/react-core';
import { RepositoryIcon } from '@patternfly/react-icons';
import { createUseStyles } from 'react-jss';
import { usePartnerFeatures } from 'Hooks/featureFlags';

const useStyles = createUseStyles({
  repositoryIcon: {
    marginLeft: '8px',
  },
});

// TODO: Confirm whether the type column replaces this label
const PartnerRepositoryLabel = () => {
  const classes = useStyles();
  const { partnerReposOn } = usePartnerFeatures();

  return (
    <Tooltip
      content={
        partnerReposOn
          ? 'Partner repository: This repository is provided by a partner organization.'
          : 'Community repository: This EPEL repository is shared across organizations.'
      }
    >
      <Label
        variant='outline'
        isCompact
        icon={<RepositoryIcon />}
        className={classes.repositoryIcon}
      >
        {partnerReposOn ? 'Partner' : 'Community'}
      </Label>
    </Tooltip>
  );
};

export default PartnerRepositoryLabel;
