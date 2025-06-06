import { Button, Flex, FlexItem, Icon } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { t_global_color_disabled_100 as global_disabled_color_100 } from '@patternfly/react-tokens';

import {
  useGetRepoConfigFileQuery,
  useGetLatestRepoConfigFileQuery,
} from 'services/Content/ContentQueries';

import { CopyIcon, DownloadIcon } from '@patternfly/react-icons';

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
  latest: boolean;
}

const RepoConfig = ({ repoUUID, snapUUID, latest }: Props) => {
  const classes = useStyles();

  const { mutateAsync } = latest
    ? useGetLatestRepoConfigFileQuery(repoUUID)
    : useGetRepoConfigFileQuery(repoUUID, snapUUID);

  const copyConfigFile = async () => {
    const data = await mutateAsync();
    navigator.clipboard.writeText(data);
  };

  const downloadConfigFile = async () => {
    const data = await mutateAsync();
    const element = document.createElement('a');
    const file = new Blob([data], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'config.repo';
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Flex>
      <FlexItem>
        <Button
          icon={
            <Icon>
              <CopyIcon />
            </Icon>
          }
          ouiaId='repo_config_file_copy_button'
          label='repo_config_file_copy_button'
          variant='link'
          className={classes.link}
          onClick={() => copyConfigFile()}
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
          label='repo_config_file_download_button'
          variant='link'
          className={classes.link}
          onClick={() => downloadConfigFile()}
          data-uuid={snapUUID}
        ></Button>
      </FlexItem>
    </Flex>
  );
};

export default RepoConfig;
