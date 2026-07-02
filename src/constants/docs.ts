export const DOCS_REDHAT_LIGHTSPEED_BASE =
  'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html';

export const MANAGING_CONTENT_AND_PATCH_GUIDE =
  'managing_system_content_and_patch_updates_on_rhel_systems';
export const USING_CONTENT_TEMPLATES_PAGE = 'using-content-templates-to-apply-system-patches';
export const DEPLOYING_RHEL_HYBRID_CLOUD_GUIDE =
  'deploying_and_managing_rhel_systems_in_hybrid_clouds';
export const MANAGING_REPOSITORIES_PAGE =
  'assembly_managing-repositories-in-red-hat-hybrid-cloud-console_host-management-services';

export const CONTENT_DOCS_URL = `${DOCS_REDHAT_LIGHTSPEED_BASE}/${MANAGING_CONTENT_AND_PATCH_GUIDE}/index`;

export const TEMPLATES_DOCS_URL = `${DOCS_REDHAT_LIGHTSPEED_BASE}/${MANAGING_CONTENT_AND_PATCH_GUIDE}/${USING_CONTENT_TEMPLATES_PAGE}`;

export const REPOSITORIES_DOCS_URL = `${DOCS_REDHAT_LIGHTSPEED_BASE}/${DEPLOYING_RHEL_HYBRID_CLOUD_GUIDE}/${MANAGING_REPOSITORIES_PAGE}`;

/** Matches docs.redhat.com URLs that might redirect to a versioned path after navigation. */
export const docsRedhatUrlMatcher = (pathFragment: string): RegExp =>
  new RegExp(
    `^https://docs\\.redhat\\.com/en/documentation/red_hat_lightspeed/.*${pathFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`,
  );
