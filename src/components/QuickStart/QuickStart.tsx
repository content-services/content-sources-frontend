import { Button, ExpandableSection, Grid, Spinner, Text } from '@patternfly/react-core';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { ArrowRightIcon } from '@patternfly/react-icons';

const useStyles = createUseStyles({
  quickstartContainer: {
    margin: '24px 24px 0',
    backgroundColor: global_BackgroundColor_100.value,
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

interface QuickStarts {
  version: number;
  updateQuickStarts: (key: string, quickstarts: unknown[]) => void;
  toggle: (quickstartId: string) => void;
  Catalog: unknown;
  activateQuickstart: (key: string) => Promise<void>;
}

export default function QuickStart() {
  const { isBeta, quickStarts } = useChrome();
  // This value only needs to be computed once
  // So we wrap it in a useMemo and give it an empty dependency array to prevent it from being called on every render.
  const isPreview = useMemo(isBeta, []);
  const [isExpanded, setIsExpanded] = useState(isPreview);
  const [quickStartLoading, setQuickStartLoading] = useState(false);
  const classes = useStyles();

  if (!isPreview) return <></>;

  const onToggle = () => setIsExpanded((prev) => !prev);
  const activateQuickStart = async () => {
    setQuickStartLoading(true);
    try {
      await (quickStarts as QuickStarts)?.activateQuickstart('insights-custom-repos');
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
        displaySize='large'
        aria-label='quickStart-expansion'
      >
        <Text>For help getting started, access the quick start below:</Text>
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
