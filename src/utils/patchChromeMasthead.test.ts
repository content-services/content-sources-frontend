import { patchChromeMasthead } from './patchChromeMasthead';

const HIDDEN_ATTR = 'data-content-sources-chrome-hidden';

describe('patchChromeMasthead', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="chr-c-beta-switcher">Beta switcher</div>
      <div id="chrome-app-render-root" style="height: calc(100vh - 40px);">
        <header class="chr-c-masthead pf-v6-c-masthead">Masthead</header>
      </div>
    `;
    document.head.innerHTML = '';
  });

  it('hides the chrome masthead and beta switcher and restores them on cleanup', async () => {
    const cleanup = patchChromeMasthead({ hide: true });
    const masthead = document.querySelector<HTMLElement>('.chr-c-masthead');
    const betaSwitcher = document.querySelector<HTMLElement>('.chr-c-beta-switcher');
    const chromeRoot = document.getElementById('chrome-app-render-root');

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(masthead?.style.display).toBe('none');
    expect(masthead?.getAttribute(HIDDEN_ATTR)).toBe('true');
    expect(betaSwitcher?.style.display).toBe('none');
    expect(betaSwitcher?.getAttribute(HIDDEN_ATTR)).toBe('true');
    expect(chromeRoot?.style.height).toBe('');
    expect(document.getElementById('content-sources-masthead-poc')).not.toBeNull();

    cleanup();

    expect(masthead?.style.display).toBe('');
    expect(masthead?.getAttribute(HIDDEN_ATTR)).toBeNull();
    expect(betaSwitcher?.style.display).toBe('');
    expect(betaSwitcher?.getAttribute(HIDDEN_ATTR)).toBeNull();
    expect(document.getElementById('content-sources-masthead-poc')).toBeNull();
  });

  it('hides masthead when only pf-v6-c-masthead is present', async () => {
    document.body.innerHTML = `
      <div id="chrome-app-render-root">
        <header class="pf-v6-c-masthead">Masthead</header>
      </div>
    `;

    const cleanup = patchChromeMasthead({ hide: true });

    await new Promise((resolve) => setTimeout(resolve, 150));

    const masthead = document.querySelector<HTMLElement>('.pf-v6-c-masthead');
    expect(masthead?.style.display).toBe('none');
    expect(masthead?.getAttribute(HIDDEN_ATTR)).toBe('true');

    cleanup();
  });

  it('re-hides chrome shell elements when chrome re-renders them', async () => {
    const cleanup = patchChromeMasthead({ hide: true });

    await new Promise((resolve) => setTimeout(resolve, 150));

    document.body.innerHTML = `
      <div class="chr-c-beta-switcher">New beta switcher</div>
      <div id="chrome-app-render-root">
        <header class="chr-c-masthead pf-v6-c-masthead">New masthead</header>
      </div>
    `;

    await new Promise((resolve) => setTimeout(resolve, 50));

    const masthead = document.querySelector<HTMLElement>('.chr-c-masthead');
    const betaSwitcher = document.querySelector<HTMLElement>('.chr-c-beta-switcher');
    expect(masthead?.style.display).toBe('none');
    expect(masthead?.getAttribute(HIDDEN_ATTR)).toBe('true');
    expect(betaSwitcher?.style.display).toBe('none');
    expect(betaSwitcher?.getAttribute(HIDDEN_ATTR)).toBe('true');

    cleanup();
  });

  it('starts observing before chrome shell elements exist', async () => {
    document.body.innerHTML = '<div id="chrome-app-render-root"></div>';

    const cleanup = patchChromeMasthead({ hide: true });

    await new Promise((resolve) => setTimeout(resolve, 50));

    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div class="chr-c-beta-switcher">Late beta switcher</div>',
    );
    document
      .getElementById('chrome-app-render-root')!
      .insertAdjacentHTML(
        'beforeend',
        '<header class="chr-c-masthead pf-v6-c-masthead">Late masthead</header>',
      );

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(document.querySelector('.chr-c-beta-switcher')?.getAttribute(HIDDEN_ATTR)).toBe('true');
    expect(document.querySelector('.chr-c-masthead')?.getAttribute(HIDDEN_ATTR)).toBe('true');

    cleanup();
  });
});
