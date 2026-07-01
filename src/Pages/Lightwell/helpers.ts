import { CONTENT_TYPE_PARAMETERS, REPOSITORY_DESCRIPTIONS } from './constants';

const getContentTypeParameters = (contentType?: string) => {
  const normalized = contentType?.trim().toLowerCase();
  if (!normalized) return undefined;
  return CONTENT_TYPE_PARAMETERS[normalized];
};

export const getEcosystemFromContentType = (contentType?: string): string | undefined =>
  getContentTypeParameters(contentType)?.ecosystem;

export const formatEcosystemDisplay = (contentType?: string): string | undefined => {
  const config = getContentTypeParameters(contentType);
  if (!config) return undefined;
  return `${config.ecosystem} (${config.label})`;
};

export const getRepositoryDescription = (contentType?: string): string | undefined => {
  const normalized = contentType?.trim().toLowerCase();
  if (!normalized) return undefined;
  return REPOSITORY_DESCRIPTIONS[normalized];
};
