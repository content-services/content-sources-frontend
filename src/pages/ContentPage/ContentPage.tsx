import { Text } from '@patternfly/react-core';
import { global_Color_100 } from '@patternfly/react-tokens';
import {
  Main,
  PageHeader as _PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { PageHeaderProps as _PageHeaderProps } from '@redhat-cloud-services/frontend-components/PageHeader/PageHeader';
import { FunctionComponent, ReactElement } from 'react';
import { createUseStyles } from 'react-jss';

import ContentListTable from '../../components/ContentListTable/ContentListTable';

const useStyles = createUseStyles({
  subtext: {
    color: global_Color_100.value,
  },
});

// Example of how to extend inaccurately typed imports
interface PageHeaderProps extends _PageHeaderProps {
  children?: ReactElement;
}

const PageHeader = _PageHeader as FunctionComponent<PageHeaderProps>;

const ContentPage = () => {
  const classes = useStyles();

  return (
    <>
      <PageHeader>
        <>
          <PageHeaderTitle title='Custom Repositories' />
          <Text className={classes.subtext}>
            View all custom repositories within your organization
          </Text>
        </>
      </PageHeader>
      <Main>
        <ContentListTable />
      </Main>
    </>
  );
};

export default ContentPage;
