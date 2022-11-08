import { Tooltip, TooltipProps } from '@patternfly/react-core';
import { cloneElement } from 'react';

interface Props extends TooltipProps {
  show: boolean;
  setDisabled?: boolean;
}

const ConditionalTooltip = ({ show, children, setDisabled, ...rest }: Props) =>
  show ? (
    <Tooltip {...rest}>
      {children && cloneElement(children, setDisabled ? { isDisabled: setDisabled } : undefined)}
    </Tooltip>
  ) : (
    <>{children}</>
  );

export default ConditionalTooltip;
