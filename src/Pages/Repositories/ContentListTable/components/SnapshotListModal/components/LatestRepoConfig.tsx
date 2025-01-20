import { Flex, FlexItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import RepoConfig from './RepoConfig';

interface Props {
  repoUUID: string;
  snapUUID: string;
}

const LatestRepoConfig = ({ repoUUID, snapUUID }: Props) => (
  <Flex>
    <FlexItem>
      <TextContent>
        <Text component={TextVariants.p}>Latest Snapshot Config:</Text>
      </TextContent>
    </FlexItem>
    <FlexItem>
      <RepoConfig repoUUID={repoUUID} snapUUID={snapUUID} latest />
    </FlexItem>
  </Flex>
);

export default LatestRepoConfig;
