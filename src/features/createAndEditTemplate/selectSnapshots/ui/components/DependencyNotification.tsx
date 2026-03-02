import { Alert, Content, ExpandableSection, FormAlert } from '@patternfly/react-core';
import Hide from 'components/Hide/Hide';
import { createUseStyles } from 'react-jss';
import { useSetUpDateApi } from '../../store/SetUpDateStore';

const useStyles = createUseStyles({
  snapshotInfoText: {
    marginRight: '16px',
  },
  whatDoesItMean: {
    paddingTop: '16px',
  },
});

export const DependencyNotification = () => {
  const classes = useStyles();

  const { isLoading, contentData, hasIsAfter, dateIsValid, isLatestSnapshot } = useSetUpDateApi();

  return (
    <Hide hide={isLatestSnapshot || !hasIsAfter || !dateIsValid}>
      <FormAlert>
        <Alert
          variant='warning'
          title='Selected date does not include the only snapshot of some selected repositories.'
          isInline
        >
          <Hide hide={isLoading}>
            {contentData.data?.reduce((acc, current, index, array) => {
              const { name } = current;
              if (index != 0 && index + 1 === array.length) {
                acc += `and "${name}" `;
              } else if (array.length === 1 || index === array.length - 2) {
                acc += `"${name}" `;
              } else {
                acc += `"${name}", `;
              }

              if (index + 1 == array.length) {
                acc += array.length === 1 ? 'repository ' : 'repositories ';
                acc += 'will be included anyway.';
              }
              return acc;
            }, 'The snapshots of the ')}
          </Hide>
          <ExpandableSection
            toggleText='What does this mean?'
            aria-label='quickStart-expansion'
            data-ouia-component-id='quickstart_expand'
            className={classes.whatDoesItMean}
          >
            <Content>
              <Content component='ul'>
                <Content component='li'>
                  No snapshots exist for these repositories on the specified date or before it.
                </Content>
                <Content component='li'>
                  The closest snapshots after that date will be used.
                </Content>
                <Content component='li'>
                  Depending on the repository and time difference, this could cause a dependency
                  issue.
                </Content>
              </Content>
            </Content>
          </ExpandableSection>
        </Alert>
      </FormAlert>
    </Hide>
  );
};
