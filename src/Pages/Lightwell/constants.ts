export const LIGHTWELL_FEATURE_NAME = 'lightwell-network';

export const lightwellPerPageKey = 'lightwellRepositoriesPerPage';

export const CONTENT_TYPE_PARAMETERS: Record<string, { ecosystem: string; label: string }> = {
  maven: { ecosystem: 'Java', label: 'Maven' },
  python: { ecosystem: 'Python', label: 'PyPI' },
};

export const REPOSITORY_DESCRIPTIONS: Record<string, string> = {
  maven:
    'Maven artifacts with Red Hat backported fixes for known vulnerabilities in pinned versions.',
  python:
    'Python wheels with Red Hat backported fixes for known vulnerabilities in pinned versions.',
};
