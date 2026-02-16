import {
  Alert,
  Content,
  ExpandableSection,
  FormAlert,
  List,
  ListItem,
} from '@patternfly/react-core';
import { useDependencyNotificationState } from '../../store/SetUpDateStore';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export const DependencyNotification = () => {
  const { isNoIssues, isFetching, isAlert, isHidden } = useDependencyNotificationState();

  if (isHidden) {
    return null;
  }

  if (isFetching) {
    return (
      <FormAlert>
        <Alert variant='info' title="Wait until snapshots' data are fetched.">
          <p>Fetching snapshots in progress.</p>
        </Alert>
      </FormAlert>
    );
  }

  if (isNoIssues) {
    return (
      <FormAlert>
        <Alert variant='info' title='Snapshots selected successufully' isInline>
          <p>All repositories set to use snapshots on the date you selected or earlier.</p>
        </Alert>
      </FormAlert>
    );
  }

  if (isAlert) {
    return (
      <FormAlert>
        <Alert variant='warning' title='Possible dependency issues' isInline>
          <Content className={spacing.mbMd}>
            Some of the repositories you selected do not have snapshots taken at the date you
            selected or earlier. For every such a&nbsp;repository, the snapshot taken closest to
            your selected date will be used.
          </Content>
          <Content className={spacing.mbSm}>These repositories are: </Content>
          <RepositoriesList />
          <NotificationExplanation />
        </Alert>
      </FormAlert>
    );
  }

  return null;
};

const RepositoriesList = () => {
  const { repositoryNames } = useDependencyNotificationState();
  return (
    <List>
      {repositoryNames.map((name) => (
        <ListItem key={name}>{name}</ListItem>
      ))}
    </List>
  );
};

const NotificationExplanation = () => (
  <ExpandableSection
    toggleText='What does this mean?'
    aria-label='quickStart-expansion'
    data-ouia-component-id='quickstart_expand'
    className={spacing.mtMd}
  >
    <Content component='ul'>
      <Content component='li'>
        No snapshots exist for these repositories on the specified date or before it.
      </Content>
      <Content component='li'>The closest snapshots after that date will be used.</Content>
      <Content component='li'>
        Depending on the repository and time difference, this could cause a dependency issue.
      </Content>
    </Content>
  </ExpandableSection>
);
