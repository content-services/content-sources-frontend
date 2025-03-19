import { Button, ExpandableSection, Grid, Spinner, Content } from '@patternfly/react-core';

import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { ArrowRightIcon } from '@patternfly/react-icons';

const useStyles = createUseStyles({
  quickstartContainer: {
    margin: '24px 24px 0',
  },
  quickstartSpinner: {
    margin: '0 0 -4px 5px',
  },
  buildCustomButton: {
    marginTop: '20px',
    padding: 0,
    fontWeight: 600,
  },
});

const quickStartExpandedKey = 'QUICKSTART_EXPANDED';

export default function RepositoryQuickStart() {
  const { isBeta, quickStarts } = useChrome();
  // These values only need to be computed once
  // So we wrap them in useMemos and give them an empty dependency array to prevent them from being called on every render.
  const isPreview = useMemo(isBeta, []);
  const quickStartExpanded = useMemo(
    () => localStorage.getItem(quickStartExpandedKey) || 'true',
    [],
  );

  const [isExpanded, setIsExpanded] = useState<boolean>(quickStartExpanded === 'true');
  const [quickStartLoading, setQuickStartLoading] = useState(false);
  const classes = useStyles();

  if (!isPreview) return <></>;

  const onToggle = () =>
    setIsExpanded((prev) => {
      localStorage.setItem(quickStartExpandedKey, `${!prev}`);
      return !prev;
    });

  const activateQuickStart = async () => {
    setQuickStartLoading(true);
    try {
      await quickStarts?.activateQuickstart('insights-custom-repos');
      onToggle();
    } catch (error) {
      console.warn(error);
    }
    setQuickStartLoading(false);
  };

  return (
    <Grid className={classes.quickstartContainer}>
      <ExpandableSection
        toggleText='Need help getting started with Preview features?'
        onToggle={onToggle}
        isExpanded={isExpanded}
        displaySize='lg'
        aria-label='quickStart-expansion'
        data-ouia-component-id='quickstart_expand'
      >
        <Content component='p'>For help getting started, access the quick start below:</Content>
        <Button
          className={classes.buildCustomButton}
          iconPosition='right'
          icon={
            quickStartLoading ? (
              <Spinner size='md' className={classes.quickstartSpinner} />
            ) : (
              <ArrowRightIcon />
            )
          }
          variant='link'
          ouiaId='quickstart_link'
          onClick={activateQuickStart}
          isDisabled={quickStartLoading}
        >
          Build an Image with Custom Content
        </Button>
      </ExpandableSection>
    </Grid>
  );
}
