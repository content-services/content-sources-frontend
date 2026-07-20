import { useEffect } from 'react';

const DIVIDER_CLASS = 'content-sources-nav-divider';
const STYLE_ID = 'content-sources-nav-divider-style';

const TEMPLATES_ITEM_SELECTOR = [
  '.pf-v6-c-nav__item:has([data-quickstart-id="/insights/content/templates"])',
  '.pf-v6-c-nav__item[data-ouia-component-id="Templates"]',
].join(', ');

declare global {
  interface Window {
    __contentSourcesNavDividerInit?: boolean;
  }
}

const ensureStyle = () => {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  // Match patternfly.org nav: hr.pf-v6-c-divider with xs spacer margins.
  // Injected into document.head so it survives leaving content-sources routes.
  style.textContent = `
    hr.pf-v6-c-divider.${DIVIDER_CLASS} {
      margin-block-start: var(--pf-t--global--spacer--xs);
      margin-block-end: var(--pf-t--global--spacer--xs);
    }
  `;
  document.head.appendChild(style);
};

const ensureDivider = () => {
  const templatesItem = document.querySelector(TEMPLATES_ITEM_SELECTOR);
  if (!templatesItem) {
    return;
  }

  if (templatesItem.nextElementSibling?.classList.contains(DIVIDER_CLASS)) {
    return;
  }

  document.querySelectorAll(`hr.${DIVIDER_CLASS}`).forEach((el) => el.remove());

  const hr = document.createElement('hr');
  hr.className = `pf-v6-c-divider ${DIVIDER_CLASS}`;
  templatesItem.after(hr);
};

/**
 * Inserts a PatternFly divider under Content > Templates in the Chrome side nav.
 * Uses a window singleton so the divider and styles stay after navigating to
 * Advisories / Packages / Systems (when this app unmounts).
 */
const useContentNavDivider = () => {
  useEffect(() => {
    if (window.__contentSourcesNavDividerInit) {
      ensureDivider();
      return;
    }
    window.__contentSourcesNavDividerInit = true;

    ensureStyle();
    ensureDivider();

    const observer = new MutationObserver(ensureDivider);
    observer.observe(document.body, { childList: true, subtree: true });

    // Intentionally no cleanup: Chrome unmounts this app on patch routes, but the
    // Content sidebar (and divider) should remain visible across those pages.
  }, []);
};

export default useContentNavDivider;
