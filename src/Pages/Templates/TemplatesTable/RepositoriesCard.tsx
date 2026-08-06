import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Flex,
  FlexItem,
  Skeleton,
} from '@patternfly/react-core';
import { RhUiCheckCircleIcon, RhUiCloseCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useCountEachRepositoryType } from 'Hooks/useCountEachRepositoryType';
import { useNavigateTo } from 'Hooks/navigation/useNavigateTo';
import {
  t_global_color_nonstatus_gray_300,
  t_global_font_size_400,
  t_global_icon_size_lg,
} from '@patternfly/react-tokens';

const RepositoriesCardHeader = () => (
  <>
    <CardTitle style={{ fontSize: t_global_font_size_400.var }}>Available repositories</CardTitle>
    <CardBody style={{ paddingBlockEnd: '0.7rem' }}>
      View, add, or upload repositories available for template creation.
    </CardBody>
  </>
);

interface RepositoryCountProps {
  count: number;
  label: string;
}

const RepositoryCount = ({ count, label }: RepositoryCountProps) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    gap={{ default: 'gapSm' }}
    flexWrap={{ default: 'nowrap' }}
  >
    <FlexItem>
      {count > 0 ? (
        <RhUiCheckCircleIcon
          style={{
            width: t_global_icon_size_lg.var,
            height: t_global_icon_size_lg.var,
            stroke: 'green',
            strokeWidth: '2',
          }}
        />
      ) : (
        <RhUiCloseCircleIcon
          color={t_global_color_nonstatus_gray_300.var}
          style={{
            width: t_global_icon_size_lg.var,
            height: t_global_icon_size_lg.var,
            stroke: 'black',
          }}
        />
      )}
    </FlexItem>
    <FlexItem>
      <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'nowrap' }}>
        <b>{`${count}`}</b>
        <span>{`${label}`}</span>
      </Flex>
    </FlexItem>
  </Flex>
);

const RepositoriesCard = () => {
  const redirect = useNavigateTo('repositories');
  const { redhatCount, epelCount, customCount, isLoading } = useCountEachRepositoryType();

  if (isLoading) {
    return (
      <Card className={spacing.mx_2xl} style={{ marginBottom: '1.5rem' }} isCompact>
        <RepositoriesCardHeader />
        <CardBody>
          <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
            <FlexItem>
              <Skeleton
                width='10rem'
                screenreaderText='Loading Red Hat Repositories count'
                role='progressbar'
              />
            </FlexItem>
            <Divider orientation={{ default: 'horizontal', md: 'vertical' }} />
            <FlexItem>
              <Skeleton
                width='10rem'
                screenreaderText='Loading EPEL Repositories count'
                role='progressbar'
              />
            </FlexItem>
            <Divider orientation={{ default: 'horizontal', md: 'vertical' }} />
            <FlexItem>
              <Skeleton
                width='10rem'
                screenreaderText='Loading Custom Repositories count'
                role='progressbar'
              />
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={spacing.mx_2xl} style={{ marginBottom: '1.5rem' }} isCompact>
      <RepositoriesCardHeader />
      <CardBody style={{ paddingBlockEnd: '0.7rem' }}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'wrap' }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
            <FlexItem>
              <RepositoryCount count={redhatCount} label='Red Hat Repositories' />
            </FlexItem>
            <Divider orientation={{ default: 'horizontal', md: 'vertical' }} />
            <FlexItem>
              <RepositoryCount count={epelCount} label='EPEL Repositories' />
            </FlexItem>
            <Divider orientation={{ default: 'horizontal', md: 'vertical' }} />
            <FlexItem>
              <RepositoryCount count={customCount} label='Custom Repositories' />
            </FlexItem>
          </Flex>
          <FlexItem>
            <Button variant='secondary' onClick={redirect}>
              Manage repositories
            </Button>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export { RepositoriesCard };
