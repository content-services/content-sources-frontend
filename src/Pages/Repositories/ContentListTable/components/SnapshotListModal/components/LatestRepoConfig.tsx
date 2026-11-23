import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, Content } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { useRepoConfig } from '../hooks/useRepoConfig';
import { CheckIcon, CopyIcon, DownloadIcon } from '@patternfly/react-icons';

const COPIED_FEEDBACK_MS = 2000;

interface Props {
  repoUUID: string;
  className?: string;
}

const LatestRepoConfig = ({ repoUUID, className }: Props) => {
  const { copyRepoConfig, downloadRepoConfig } = useRepoConfig(repoUUID);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const onCopy = async () => {
    await copyRepoConfig();
    setCopied(true);
  };

  const actions = (
    <>
      <Button
        variant='tertiary'
        size='sm'
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        onClick={onCopy}
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
