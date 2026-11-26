import { Button, Card, CardBody, CardHeader, CardTitle, Content } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { useRepoConfig } from '../hooks/useRepoConfig';
import { CheckIcon, CopyIcon, DownloadIcon } from '@patternfly/react-icons';

interface Props {
  repoUUID: string;
  className?: string;
}

const LatestRepoConfig = ({ repoUUID, className }: Props) => {
  const { copyRepoConfig, downloadRepoConfig, copied } = useRepoConfig(repoUUID);

  const actions = (
    <>
      <Button
        variant='tertiary'
        size='sm'
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        onClick={copyRepoConfig}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <Button variant='tertiary' size='sm' icon={<DownloadIcon />} onClick={downloadRepoConfig}>
        Download
      </Button>
    </>
  );

  return (
    <Card className={css(spacing.mbMd, className)} ouiaId='latest-snapshot-config'>
      <CardHeader actions={{ actions }} hasWrap>
        <CardTitle component='h3'>Latest repository configuration</CardTitle>
      </CardHeader>
      <CardBody>
        <Content component='p'>
          Configure your host with this <code>.repo</code> file to always use the latest content.
        </Content>
      </CardBody>
    </Card>
  );
};

export default LatestRepoConfig;
