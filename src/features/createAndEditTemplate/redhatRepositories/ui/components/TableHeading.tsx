import { Content, ContentVariants, Flex, Title } from '@patternfly/react-core';
import { useDerivedState } from '../../store/RedhatRepositoriesStore';

export const TableHeading = () => {
  const { areReposAvailableToSelect } = useDerivedState();
  return (
    <>
      <Flex
        direction={{ default: 'row' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <Title ouiaId='additional_red_hat_repositories' headingLevel='h1'>
          Additional Red Hat repositories
        </Title>
      </Flex>
      <Flex direction={{ default: 'row' }}>
        <Content component={ContentVariants.p}>
          {areReposAvailableToSelect ? 'You can select additional Red Hat repositories. ' : ''}
          Core repositories of your OS version have been added.
        </Content>
      </Flex>
    </>
  );
};
