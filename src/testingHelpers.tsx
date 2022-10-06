import { QueryClient, QueryClientProvider } from 'react-query';
import { RepositoryParamsResponse, ValidationResponse } from './services/Content/ContentApi';

const queryClient = new QueryClient({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  logger: {
    log: console.log,
    warn: console.warn,
    // ✅ no more errors on the console with tests
    error: () => null,
  },
  defaultOptions: {
    queries: {
      // ✅ turns retries off (prevents testing timeouts)
      retry: false,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export const ReactQueryTestWrapper = ({ children }: Props) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export const testRepositoryParamsResponse: RepositoryParamsResponse = {
  distribution_versions: [
    {
      name: 'Any OS version',
      label: 'any',
    },
    {
      name: 'el7',
      label: '7',
    },
    {
      name: 'el8',
      label: '8',
    },
    {
      name: 'el9',
      label: '9',
    },
  ],
  distribution_arches: [
    { name: 'Any architecture', label: 'any' },
    {
      name: 'x86_64',
      label: 'x86_64',
    },
    {
      name: 's390x',
      label: 's390x',
    },
    {
      name: 'ppc64le',
      label: 'ppc64le',
    },
    {
      name: 'aarch64',
      label: 'aarch64',
    },
  ],
};

export const defaultValidationErrorData: ValidationResponse = [
  {
    name: {
      skipped: false,
      valid: true,
      error: '',
    },
    url: {
      skipped: false,
      valid: false,
      error: 'URL cannot be blank',
      http_code: 0,
      metadata_present: false,
      metadata_signature_present: false,
    },
  },
];

export const passingValidationErrorData: ValidationResponse = [
  {
    name: {
      skipped: false,
      valid: true,
      error: '',
    },
    gpg_key: {
      skipped: false,
      valid: true,
      error: '',
    },
    url: {
      skipped: false,
      valid: true,
      error: '',
      http_code: 200,
      metadata_present: true,
      metadata_signature_present: true,
    },
  },
];
