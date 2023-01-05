import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner, Tooltip } from '@patternfly/react-core';
import StatusText from './StatusText';
import {
  global_danger_color_100,
  global_success_color_100,
  global_warning_color_100,
} from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';

const red = global_danger_color_100.value;
const green = global_success_color_100.value;
const gold = global_warning_color_100.value;

const useStyles = createUseStyles({
  spinner: {
    animationDuration: '6s !important',
    margin: '-3px 0',
  },
});
interface Props {
  status?: string;
  error?: string;
}

const StatusIcon = ({ status, error }: Props) => {
  const classes = useStyles();
  switch (status) {
    case 'Valid':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <CheckCircleIcon color={green} />
          </FlexItem>
          <FlexItem>
            <StatusText color='green'>Valid</StatusText>
          </FlexItem>
        </Flex>
      );
    case 'Invalid':
      return (
        <Tooltip position='top-start' content={error}>
          <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <ExclamationCircleIcon color={red} />
            </FlexItem>
            <FlexItem>
              <StatusText color='red'>Invalid</StatusText>
            </FlexItem>
          </Flex>
        </Tooltip>
      );
    case 'Unavailable':
      return (
        <Tooltip position='top-start' content={error}>
          <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <ExclamationTriangleIcon color={gold} />
            </FlexItem>
            <FlexItem>
              <StatusText color='gold'>Unavailable</StatusText>
            </FlexItem>
          </Flex>
        </Tooltip>
      );
    case 'Pending':
      return (
        <Tooltip position='top-start' content='Repository has not been introspected yet'>
          <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <Spinner size='md' className={classes.spinner} />
            </FlexItem>
            <FlexItem>
              <StatusText color='blue'>In progress</StatusText>
            </FlexItem>
          </Flex>
        </Tooltip>
      );

    default:
      return <></>;
  }
};

export default StatusIcon;
