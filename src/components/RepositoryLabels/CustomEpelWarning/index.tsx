import { Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  warningMargin: {
    marginLeft: '8px',
  },
});

const CustomEpelWarning = () => {
  const classes = useStyles();
  return (
    <Tooltip content='Custom EPEL repositories will stop being snapshotted. Please use the community EPEL repositories instead.'>
      <Icon status='warning' isInline className={classes.warningMargin}>
        <ExclamationTriangleIcon />
      </Icon>
    </Tooltip>
  );
};

export default CustomEpelWarning;
