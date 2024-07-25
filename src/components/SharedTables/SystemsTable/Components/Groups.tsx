import { Button, Text } from '@patternfly/react-core';

import { global_disabled_color_100 } from '@patternfly/react-tokens';
import useRootPath from 'Hooks/useRootPath';
import { createUseStyles } from 'react-jss';
import { INVENTORY_WORKSPACES_ROUTE } from 'Routes/constants';
import type { SystemGroup } from 'services/Systems/SystemsApi';

const useStyles = createUseStyles({
  forceDisabled: {
    color: global_disabled_color_100.value + '!important',
  },
});

interface Props {
  groups: SystemGroup[];
}

export default function Groups({ groups }: Props) {
  // we use a .slice to remove the first item in the string a "/" in this case so that the base route is used
  const basePath = useRootPath().slice(1).replace('content', '');

  const classes = useStyles();
  // Only show the first group if there is one for now
  if (!groups.length) return <Text className={classes.forceDisabled}>No groups</Text>;
  const { id, name } = groups[0];
  return (
    <Button
      isInline
      variant='link'
      component='a'
      href={`${basePath}${INVENTORY_WORKSPACES_ROUTE}/${id}`}
    >
      {name}
    </Button>
  );
}
