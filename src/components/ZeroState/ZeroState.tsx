import { Suspense } from 'react';
import { Bullseye, Button, Grid, Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { Outlet } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

import { useAppContext } from '../../middleware/AppContext';

const useStyles = createUseStyles({
  contentZerostate: {
    minHeight: '100%',
    '& .bannerBefore': { maxHeight: '320px!important' },
    '& .bannerRight': { justifyContent: 'space-evenly!important' },
  },
});

export const ZeroState = () => {
  const classes = useStyles();
  const { setZeroState } = useAppContext();

  const handleClick = () => {
    setZeroState(false);
  };

  return (
    <>
      <Suspense
        fallback={
          <Bullseye>
            <Spinner size='xl' />
          </Bullseye>
        }
      >
        <Grid className={classes.contentZerostate}>
          <AsyncComponent
            appId='content_zero_state'
            appName='dashboard'
            module='./AppZeroState'
            scope='dashboard'
            ErrorComponent={<ErrorState />}
            app='Content_management'
            ouiaId='get_started_from_zerostate_description'
            customText='Get started with Insights by adding repositories'
            customButton={
              <Button
                id='get-started-repositories-button'
                ouiaId='get_started_repositories_button'
                className='pf-c-button pf-m-primary pf-u-p-md pf-u-font-size-md'
                onClick={() => handleClick()}
              >
                Add repositories now
              </Button>
            }
          />
        </Grid>
      </Suspense>
      <Outlet />
    </>
  );
};
