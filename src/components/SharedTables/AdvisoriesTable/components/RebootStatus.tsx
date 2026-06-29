import { Flex, FlexItem } from '@patternfly/react-core';
import { OnIcon } from '@patternfly/react-icons';
import {
  t_global_color_status_danger_100,
  t_global_color_disabled_100,
} from '@patternfly/react-tokens';
import text from '@patternfly/react-styles/css/utilities/Text/text';

interface Props {
  rebootSuggested: boolean;
}

export default function RebootStatus({ rebootSuggested }: Props) {
  const color = rebootSuggested
    ? t_global_color_status_danger_100.value
    : t_global_color_disabled_100.value;

  return (
    <Flex gap={{ default: 'gapSm' }} role='group' aria-label='Reboot status'>
      <FlexItem>
        <OnIcon style={{ color }} />
      </FlexItem>
      <FlexItem>
        System reboot{' '}
        <span className={text.fontWeightBold}>is {rebootSuggested ? '' : 'not '}</span>
        required
      </FlexItem>
    </Flex>
  );
}
