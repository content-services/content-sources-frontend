import { Modal, type ModalProps } from '@patternfly/react-core';
import {
  getLwModalDefaults,
  mergeClassNames,
  mergeComponentProps,
} from 'kit/components/components.config';

export type LwModalProps = ModalProps;

/** Configured PF Modal root. Header, body, and footer remain call-site children. */
export function LwModal({ className, children, ...rest }: LwModalProps) {
  const modalProps = mergeComponentProps(getLwModalDefaults(), {
    ...rest,
    className: mergeClassNames('lw-c-modal', className),
  });
  return <Modal {...modalProps}>{children}</Modal>;
}
