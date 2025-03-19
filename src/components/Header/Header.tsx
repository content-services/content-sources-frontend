import { Content } from '@patternfly/react-core';
import {
  OpenSourceBadge,
  PageHeader as _PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { PageHeaderProps as _PageHeaderProps } from '@redhat-cloud-services/frontend-components/PageHeader/PageHeader';

import { FunctionComponent, ReactElement } from 'react';
import { createUseStyles } from 'react-jss';

interface PageHeaderProps extends _PageHeaderProps {
  children?: ReactElement | Array<ReactElement>;
}

// Example of how to extend inaccurately typed imports
const PageHeader = _PageHeader as FunctionComponent<PageHeaderProps>;

const useStyles = createUseStyles({
  subtext: {
    paddingTop: '8px',
  },
  remove100percent: {
    height: 'unset',
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
      <PageHeaderTitle
        title={
          <>
            {title}
            <OpenSourceBadge repositoriesURL='https://github.com/content-services/content-sources-frontend' />
          </>
        }
        className={classes.remove100percent}
      />
      <Content component='p' className={classes.subtext} ouiaId={ouiaId}>
        {paragraph}
      </Content>
    </PageHeader>
  );
}
