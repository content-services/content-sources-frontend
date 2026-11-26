import { Button, Flex, FlexItem, Icon } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { t_global_color_disabled_100 as global_disabled_color_100 } from '@patternfly/react-tokens';

import { CheckIcon, CopyIcon, DownloadIcon } from '@patternfly/react-icons';
import { useRepoConfig } from '../hooks/useRepoConfig';

const useStyles = createUseStyles({
  text: {
    color: global_disabled_color_100.value,
    width: 'fit-content',
  },
  link: {
    padding: 0,
  },
});

interface Props {
  repoUUID: string;
  snapUUID: string;
}

const RepoConfig = ({ repoUUID, snapUUID }: Props) => {
  const classes = useStyles();
  const { copyRepoConfig, downloadRepoConfig, copied } = useRepoConfig(repoUUID, snapUUID);

  return (
    <Flex>
      <FlexItem>
        <Button
          icon={<Icon>{copied ? <CheckIcon /> : <CopyIcon />}</Icon>}
          ouiaId='repo_config_file_copy_button'
          aria-label={copied ? 'Copied' : 'Copy repository config'}
          variant='link'
          className={classes.link}
          onClick={copyRepoConfig}
          data-uuid={snapUUID}
        ></Button>
      </FlexItem>
      <FlexItem>
        <Button
          icon={
            <Icon>
              <DownloadIcon />
            </Icon>
          }
          ouiaId='repo_config_file_download_button'
          aria-label='Download repository config'
          variant='link'
          className={classes.link}
          onClick={downloadRepoConfig}
          data-uuid={snapUUID}
        ></Button>
      </FlexItem>
    </Flex>
  );
};

export default RepoConfig;
