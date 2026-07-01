/** POC: hide insights-chrome shell UI via DOM manipulation until a platform API exists. */
export const ENABLE_MASTHEAD_POC = true;

const MASTHEAD_SELECTORS = [
  '.chr-c-masthead',
  '.pf-v6-c-page > .pf-v6-c-masthead',
  '#chrome-app-render-root .pf-v6-c-masthead',
  '#chrome-entry .pf-v6-c-masthead',
  '[class*="chr-c-masthead"]',
];

const BETA_SWITCHER_SELECTORS = ['.chr-c-beta-switcher', '[class*="chr-c-beta-switcher"]'];

const CHROME_SHELL_SELECTORS = [...MASTHEAD_SELECTORS, ...BETA_SWITCHER_SELECTORS];

const CHROME_ROOT_SELECTOR = '#chrome-app-render-root';
const STYLE_ID = 'content-sources-masthead-poc';
const HIDDEN_ATTR = 'data-content-sources-chrome-hidden';
const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 30_000;

const POC_STYLE = `
.chr-c-masthead[${HIDDEN_ATTR}="true"],
.pf-v6-c-masthead[${HIDDEN_ATTR}="true"],
.chr-c-beta-switcher[${HIDDEN_ATTR}="true"] {
  display: none !important;
  min-height: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}
`;

type HideCounts = {
  masthead: number;
  beta: number;
  total: number;
};

function isBetaSwitcherSelector(selector: string): boolean {
  return BETA_SWITCHER_SELECTORS.includes(selector);
}

function hideElementsForSelectors(selectors: string[]): HideCounts {
  const counts = { masthead: 0, beta: 0, total: 0 };
  const hiddenElements = new Set<HTMLElement>();

  for (const selector of selectors) {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (hiddenElements.has(element)) {
        return;
      }

      hiddenElements.add(element);
      element.style.display = 'none';
      element.setAttribute(HIDDEN_ATTR, 'true');
      counts.total += 1;

      if (isBetaSwitcherSelector(selector)) {
        counts.beta += 1;
      } else {
        counts.masthead += 1;
      }
    });
  }

  return counts;
}

function hideChromeShell(): HideCounts {
  const mastheadCounts = hideElementsForSelectors(MASTHEAD_SELECTORS);
  const betaCounts = hideElementsForSelectors(BETA_SWITCHER_SELECTORS);

  document.querySelector<HTMLElement>(CHROME_ROOT_SELECTOR)?.style.removeProperty('height');

  return {
    masthead: mastheadCounts.masthead,
    beta: betaCounts.beta,
    total: mastheadCounts.total + betaCounts.total,
  };
}

function showChromeShell() {
  for (const selector of CHROME_SHELL_SELECTORS) {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      element.style.removeProperty('display');
      element.removeAttribute(HIDDEN_ATTR);
    });
  }
}

function hasVisibleChromeShell(): boolean {
  return CHROME_SHELL_SELECTORS.some((selector) =>
    Array.from(document.querySelectorAll<HTMLElement>(selector)).some(
      (element) => element.getAttribute(HIDDEN_ATTR) !== 'true',
    ),
  );
}

function injectPocStyle() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = POC_STYLE;
  document.head.appendChild(style);
}

function removePocStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

function logHideCounts(counts: HideCounts) {
  if (counts.total === 0) {
    return;
  }

  console.info(
    `[patchChromeMasthead] hidden ${counts.total} element(s) (masthead: ${counts.masthead}, beta: ${counts.beta})`,
  );
}

export type PatchChromeMastheadOptions = {
  hide?: boolean;
};

export function patchChromeMasthead({ hide = true }: PatchChromeMastheadOptions = {}): () => void {
  if (!hide) {
    return () => undefined;
  }

  let observer: MutationObserver | null = null;
  let pollIntervalId: number | null = null;
  let cancelled = false;
  let lastLoggedTotal = 0;

  injectPocStyle();
  console.info('[patchChromeMasthead] started');

  const applyHide = () => {
    if (cancelled) {
      return;
    }

    const counts = hideChromeShell();
    if (counts.total > 0 && counts.total !== lastLoggedTotal) {
      lastLoggedTotal = counts.total;
      logHideCounts(counts);
    }
  };

  applyHide();

  observer = new MutationObserver(() => {
    if (hasVisibleChromeShell()) {
      applyHide();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const pollStartedAt = Date.now();
  pollIntervalId = window.setInterval(() => {
    applyHide();

    if (Date.now() - pollStartedAt >= POLL_TIMEOUT_MS) {
      if (pollIntervalId !== null) {
        window.clearInterval(pollIntervalId);
        pollIntervalId = null;
      }

      if (!cancelled && lastLoggedTotal === 0) {
        console.warn('[patchChromeMasthead] No chrome shell targets found before timeout.');
      }
    }
  }, POLL_INTERVAL_MS);

  return () => {
    cancelled = true;
    observer?.disconnect();
    observer = null;

    if (pollIntervalId !== null) {
      window.clearInterval(pollIntervalId);
      pollIntervalId = null;
    }

    showChromeShell();
    removePocStyle();
  };
}
