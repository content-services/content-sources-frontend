import { Flex, FlexItem, Content, ContentVariants } from '@patternfly/react-core';
import RepoConfig from './RepoConfig';

interface Props {
  repoUUID: string;
  snapUUID: string;
}

const LatestRepoConfig = ({ repoUUID, snapUUID }: Props) => (
  <Flex>
    <FlexItem>
      <Content>
        <Content component={ContentVariants.p}>Latest Snapshot Config:</Content>
      </Content>
    </FlexItem>
    <FlexItem>
      <RepoConfig repoUUID={repoUUID} snapUUID={snapUUID} latest />
    </FlexItem>
  </Flex>
);

export default LatestRepoConfig;
