import { ErrorBoundary as _ErrorBoundaryPage } from '@redhat-cloud-services/frontend-components';

const ErrorBoundaryPage = _ErrorBoundaryPage as unknown as React.FunctionComponent<{
  children?: React.ReactNode;
  headerTitle: string;
  errorTitle?: string;
  errorDescription?: string;
}>;

interface Props {
  children: React.ReactNode;
}

export const ErrorPage = ({ children }: Props) => (
  <ErrorBoundaryPage
    headerTitle='Content Sources'
    errorTitle='Unhandled error'
    errorDescription='There was a problem trying to process your request'
  >
    {children}
  </ErrorBoundaryPage>
);
