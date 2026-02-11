import { Button, Content, ContentVariants, Flex, Title } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import { createUseStyles } from 'react-jss';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { CONTENT_LIST_KEY } from 'services/Content/ContentQueries';
import { useCustomRepositoriesApi } from '../../store/CustomRepositoriesStore';
import { useQueryClient } from 'react-query';

const useStyles = createUseStyles({
  reduceTrailingMargin: {
    marginRight: '12px!important',
  },
});

export const TableHeading = () => {
  const classes = useStyles();

  const { isLoading, isFetching, pathname } = useCustomRepositoriesApi();
  const queryClient = useQueryClient();

  return (
    <>
      <Flex
        direction={{ default: 'row' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <Title ouiaId='custom_repositories' headingLevel='h1'>
          Other repositories
        </Title>
        <Button
          id='refreshContentList'
          ouiaId='refresh_content_list'
          variant='link'
          icon={isLoading || isFetching ? undefined : <SyncAltIcon />}
          isLoading={isLoading || isFetching}
          isDisabled={isLoading || isFetching}
          onClick={() => queryClient!.invalidateQueries(CONTENT_LIST_KEY)}
        >
          Refresh repository list
        </Button>
      </Flex>
      <Flex direction={{ default: 'row' }}>
        <Content component={ContentVariants.p} className={classes.reduceTrailingMargin}>
          pathname Select custom or EPEL repositories.
        </Content>
        <UrlWithExternalIcon
          href={pathname + '/' + REPOSITORIES_ROUTE}
          customText='Create and  manage repositories here.'
        />
      </Flex>
    </>
  );
};
