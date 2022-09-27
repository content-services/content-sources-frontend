import { Text, Tooltip } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { global_disabled_color_100 } from '@patternfly/react-tokens';

const useStyles = createUseStyles({
  text: {
    color: global_disabled_color_100.value,
    width: 'fit-content',
  },
});

interface Props {
  count?: number;
  status?: string;
}

const PackageCount = ({ count, status }: Props) => {
  const classes = useStyles();

  if (!count && status === 'Pending') {
    return (
      <Tooltip isContentLeftAligned content='Repository has not been introspected yet'>
        <Text className={classes.text}>N/A</Text>
      </Tooltip>
    );
  }

  return <>{count}</>;
};

export default PackageCount;
