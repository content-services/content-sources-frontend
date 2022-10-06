import { Tooltip, TooltipProps } from '@patternfly/react-core';

interface Props extends TooltipProps {
  show: boolean;
}

const OptionalTooltip = ({ show, children, ...rest }: Props) =>
  show ? <Tooltip {...rest}>{children}</Tooltip> : <>{children}</>;

export default OptionalTooltip;
