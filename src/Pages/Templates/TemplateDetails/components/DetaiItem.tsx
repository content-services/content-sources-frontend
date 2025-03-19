import { Flex, Content } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  container: {
    marginRight: '48px',
    flex: 1,
  },
  title: {
    textWrap: 'nowrap',
    minWidth: '170px',
  },
  content: {
    width: '500px',
    extend: 'pf-v6-u-color-100',
  },
});

export default function DetailItem({ title, value }: { title: string; value?: string | number }) {
  if (!value) return <></>;
  const classes = useStyles();
  return (
    <Flex
      direction={{ default: 'row' }}
      flexWrap={{ default: 'nowrap' }}
      className={classes.container}
    >
      <Content component='p' className={classes.title}>
        {title}
      </Content>
      <Content component='p' className={classes.content}>
        {value || '-'}
      </Content>
    </Flex>
  );
}
