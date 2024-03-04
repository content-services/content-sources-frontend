import { Text } from '@patternfly/react-core';
import {
  PageHeader as _PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { PageHeaderProps as _PageHeaderProps } from '@redhat-cloud-services/frontend-components/PageHeader/PageHeader';
import { global_Color_100 } from '@patternfly/react-tokens';

import { FunctionComponent, ReactElement } from 'react';
import { createUseStyles } from 'react-jss';

interface PageHeaderProps extends _PageHeaderProps {
  children?: ReactElement | Array<ReactElement>;
}

// Example of how to extend inaccurately typed imports
const PageHeader = _PageHeader as FunctionComponent<PageHeaderProps>;

const useStyles = createUseStyles({
  subtext: {
    color: global_Color_100.value,
    paddingTop: '8px',
  },
});

interface Props {
  title: string;
  ouiaId: string;
  paragraph: string;
}

export default function Header({ title, ouiaId, paragraph }: Props) {
  const classes = useStyles();

  return (
    <PageHeader>
      <PageHeaderTitle title={title} />
      <Text className={classes.subtext} ouiaId={ouiaId}>
        {paragraph}
      </Text>
    </PageHeader>
  );
}
