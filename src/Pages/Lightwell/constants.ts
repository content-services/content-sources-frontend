export const LIGHTWELL_FEATURE_NAME = 'lightwell-network';

export const lightwellPerPageKey = 'lightwellRepositoriesPerPage';

export const CONTENT_TYPE_PARAMETERS: Record<string, { ecosystem: string; label: string }> = {
  maven: { ecosystem: 'Java', label: 'Maven' },
  pypi: { ecosystem: 'Python', label: 'PyPI' },
};

export const REPOSITORY_DESCRIPTIONS: Record<string, string> = {
  maven:
    'Maven artifacts with Red Hat backported fixes for known vulnerabilities in pinned versions.',
  pypi: 'Python wheels with Red Hat backported fixes for known vulnerabilities in pinned versions.',
};

export const LIGHTWELL_PROJECT_URL = 'https://www.redhat.com/en/lightwell#follow-our-progress';
