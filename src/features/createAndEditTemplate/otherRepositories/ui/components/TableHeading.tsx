import { Button, Content, ContentVariants, Flex, Title } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useHref } from 'react-router-dom';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { useCustomRepositoriesApi } from '../../store/CustomRepositoriesStore';

export const TableHeading = () => {
  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';
  const href = pathname + '/' + REPOSITORIES_ROUTE;

  return (
    <>
      <Flex
        direction={{ default: 'row' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <Title ouiaId='custom_repositories' headingLevel='h1'>
          Other repositories
        </Title>
        <RefreshListButton />
      </Flex>
      <Flex direction={{ default: 'row' }}>
        <Content component={ContentVariants.p}>Select custom or EPEL repositories.</Content>
        <UrlWithExternalIcon href={href} customText='Create and  manage repositories here.' />
      </Flex>
    </>
  );
};

const RefreshListButton = () => {
  const { refetchOtherRepositories, isLoading, isFetching } = useCustomRepositoriesApi();

  const isQueryInProgress = isLoading || isFetching;
  const showLoadingIcon = isQueryInProgress ? undefined : <SyncAltIcon />;

  return (
    <Button
      id='refreshContentList'
      ouiaId='refresh_content_list'
      variant='link'
      icon={showLoadingIcon}
      isLoading={isQueryInProgress}
      isDisabled={isQueryInProgress}
      onClick={refetchOtherRepositories}
    >
      Refresh repository list
    </Button>
  );
};
