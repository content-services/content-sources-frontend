import { useMemo } from 'react';
import { useRemoteHook } from '@scalprum/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import { Stack, StackItem } from '@patternfly/react-core';

import { useLightwellRootPath } from '../../../Hooks/Lightwell/navigation/useLightwellRootPath';
import { useAppContext } from 'middleware/AppContext';
import { isFeatureOn } from 'services/Features/FeatureApi';
import BeaconIntake from './BeaconIntake';
import BeaconTable from './BeaconTable';

const DROP_LAST_CHROME_SEGMENT_OPTIONS = { dropLastChromeSegment: true };

/**
 * Entry point for the Beacon page. Owns the Chrome breadcrumbs and chooses which
 * views to show based on the user's feature flags:
 * - `lightwellclearinghouse` / `lightwellclearinghouseread` → BeaconIntake
 * - `lightwellbeacon` → BeaconTable
 * Both can render together when the user holds both sets of flags.
 */
const Beacon = () => {
  const rootPath = useLightwellRootPath();
  const appBreadcrumbsEnabled = useFlag('platform.chrome.app-breadcrumbs');
  const breadcrumbs = useMemo(
    () => [{ pathname: `${rootPath}/beacon`, title: 'Lightwell Beacon' }],
    [rootPath],
  );

  useRemoteHook({
    scope: 'chrome',
    module: './breadcrumbs/useReplaceBreadcrumbs',
    args: appBreadcrumbsEnabled ? [breadcrumbs, DROP_LAST_CHROME_SEGMENT_OPTIONS] : [[]],
  });

  const { features } = useAppContext();

  const showIntake =
    isFeatureOn(features?.lightwellclearinghouse) ||
    isFeatureOn(features?.lightwellclearinghouseread);
  const showTable = isFeatureOn(features?.lightwellbeacon);

  return (
    <Stack hasGutter>
      {showIntake ? (
        <StackItem>
          <BeaconIntake />
        </StackItem>
      ) : null}
      {showTable ? (
        <StackItem>
          <BeaconTable />
        </StackItem>
      ) : null}
    </Stack>
  );
};

export default Beacon;
