import { UrlsForArchitectureAndVersion } from 'features/createAndEditTemplate/shared/types/types';

export const REPOSITORY_URLS: UrlsForArchitectureAndVersion = {
  'x86_64-8': [
    'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/appstream/os/',
    'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/baseos/os/',
  ],
  'x86_64-9': [
    'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/appstream/os/',
    'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/baseos/os/',
  ],
  'x86_64-10': [
    'https://cdn.redhat.com/content/dist/rhel10/10/x86_64/appstream/os/',
    'https://cdn.redhat.com/content/dist/rhel10/10/x86_64/baseos/os/',
  ],
  'aarch64-8': [
    'https://cdn.redhat.com/content/dist/rhel8/8/aarch64/appstream/os/',
    'https://cdn.redhat.com/content/dist/rhel8/8/aarch64/baseos/os/',
  ],
  'aarch64-9': [
    'https://cdn.redhat.com/content/dist/rhel9/9/aarch64/appstream/os/',
    'https://cdn.redhat.com/content/dist/rhel9/9/aarch64/baseos/os/',
  ],
  'aarch64-10': [
    'https://cdn.redhat.com/content/dist/rhel10/10/aarch64/appstream/os/',
    'https://cdn.redhat.com/content/dist/rhel10/10/aarch64/baseos/os/',
  ],
};
