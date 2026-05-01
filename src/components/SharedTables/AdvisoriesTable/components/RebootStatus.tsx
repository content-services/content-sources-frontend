import { Flex, FlexItem } from '@patternfly/react-core';
import { OffIcon, OnIcon } from '@patternfly/react-icons';
import {
  t_global_color_status_danger_100,
  t_global_color_status_success_100,
} from '@patternfly/react-tokens';

interface Props {
  rebootSuggested: boolean;
}

export default function RebootStatus({ rebootSuggested }: Props) {
  return (
    <Flex gap={{ default: 'gapSm' }}>
      <FlexItem>
        {rebootSuggested ? (
          <OffIcon style={{ color: t_global_color_status_danger_100.value }} />
        ) : (
          <OnIcon style={{ color: t_global_color_status_success_100.value }} />
        )}
      </FlexItem>
      <FlexItem>{`Reboot is ${rebootSuggested ? '' : 'not'} required`}</FlexItem>
    </Flex>
  );
}
