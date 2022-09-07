import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import StatusText from './StatusText';
import { global_danger_color_100, global_success_color_100, global_warning_color_100, global_info_color_100 } from '@patternfly/react-tokens';

const red = global_danger_color_100.value;
const green = global_success_color_100.value;
const gold = global_warning_color_100.value;
const blue = global_info_color_100.value;

interface Props {
  status?: string,
  error?: string,
}

const StatusIcon = ({ status, error }: Props) => {
  switch(status) {
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
      )
    case 'Invalid':
      return(
        <Tooltip position='top-start' content={error}>
          <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <ExclamationCircleIcon color={red}/>
            </FlexItem>
            <FlexItem>
              <StatusText color='red'>Invalid</StatusText>
            </FlexItem>
          </Flex>
        </Tooltip>
      )
    case 'Unavailable':
      return(
        <Tooltip position='top-start' content={error}>
          <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <ExclamationTriangleIcon color={gold}/>
            </FlexItem>
            <FlexItem>
              <StatusText color='gold'>Unavailable</StatusText>
            </FlexItem>
          </Flex>
        </Tooltip>
      )
    case 'Pending':
      return(
        <Tooltip position='top-start' content='Repository has not been introspected yet'>
          <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
            <FlexItem spacer={{ default: 'spacerSm' }}>
              <InfoCircleIcon title='blue' color={blue}/>
            </FlexItem>
            <FlexItem>
              <StatusText color='blue'>Pending</StatusText>
            </FlexItem>
          </Flex>
        </Tooltip>
      )
    default:
      return <></>
  }
}

export default StatusIcon
