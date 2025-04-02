import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  BanIcon,
  ClockIcon,
} from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import StatusText from 'components/StatusText/StatusText';
import {
  global_danger_color_100,
  global_success_color_100,
  global_warning_color_100,
} from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import { AdminTask } from 'services/Admin/AdminTaskApi';

const red = global_danger_color_100.value;
const green = global_success_color_100.value;
const gold = global_warning_color_100.value;

const useStyles = createUseStyles({
  spinner: {
    animationDuration: '6s !important',
    margin: '-3px 0',
  },
  red: {
    color: red,
    fill: red,
  },
  green: {
    color: green,
    fill: green,
  },
  gold: {
    color: gold,
    fill: gold,
  },
});

interface Props {
  status: AdminTask['status'];
  removeText?: boolean;
}

const StatusIcon = ({ status, removeText = false }: Props) => {
  const classes = useStyles();

  switch (status) {
    case 'running':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <Spinner size='md' className={classes.spinner} />
          </FlexItem>
          {!removeText && (
            <FlexItem>
              <StatusText color='blue'>Running</StatusText>
            </FlexItem>
          )}
        </Flex>
      );
    case 'failed':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <ExclamationCircleIcon className={classes.red} />
          </FlexItem>
          {!removeText && (
            <FlexItem>
              <StatusText color='red'>Failed</StatusText>
            </FlexItem>
          )}
        </Flex>
      );
    case 'completed':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <CheckCircleIcon className={classes.green} />
          </FlexItem>
          {!removeText && (
            <FlexItem>
              <StatusText color='green'>Completed</StatusText>
            </FlexItem>
          )}
        </Flex>
      );
    case 'canceled':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <BanIcon className={classes.red} />
          </FlexItem>
          {!removeText && (
            <FlexItem>
              <StatusText color='red'>Canceled</StatusText>
            </FlexItem>
          )}
        </Flex>
      );
    case 'pending':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <ClockIcon className={classes.gold} />
          </FlexItem>
          {!removeText && (
            <FlexItem>
              <StatusText color='gold'>Pending</StatusText>
            </FlexItem>
          )}
        </Flex>
      );
    default:
      return <></>;
  }
};

export default StatusIcon;
