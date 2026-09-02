/**
 * PDF header/footer templates for Puppeteer's displayHeaderFooter.
 * Ported from crc-pdf-generator's src/server/render-template/.
 *
 * NOTE: Puppeteer header/footer templates run in a restricted Chromium context
 * that cannot load external fonts. We use font-family fallback chains instead.
 * This matches the old crc-pdf-generator's header-template.html behavior.
 */
import { type PropsWithChildren } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function getHeaderDate(): string {
  const date = new Date();
  const day = date.getDate();
  const year = date.getFullYear();
  return `${day} ${date.toLocaleString('en-us', {
    month: 'short',
  })} ${year} ${date.toLocaleString('en-us', {
    hour: '2-digit',
    hour12: false,
    minute: 'numeric',
  })} UTC`;
}

const HeaderContainer = ({ children }: PropsWithChildren) => (
  <div
    style={{
      width: '100%',
      paddingTop: 16,
      paddingRight: 24,
      paddingLeft: 24,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'end',
    }}
  >
    {children}
  </div>
);

const LightwellLogo = ({ logoSvg }: { logoSvg?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28 }}>
    {logoSvg && (
      <div style={{ width: 28, height: 28 }} dangerouslySetInnerHTML={{ __html: logoSvg }} />
    )}
    <span
      style={{
        fontFamily: 'Red Hat Text, Helvetica, Arial, sans-serif',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 600,
        color: '#151515',
      }}
    >
      Lightwell
    </span>
  </div>
);

const Header = ({ logoSvg }: { logoSvg?: string }) => (
  <HeaderContainer>
    <div style={{ width: 'auto' }}>
      <LightwellLogo logoSvg={logoSvg} />
    </div>
    <div style={{ marginLeft: 'auto' }}>
      <p>
        Prepared: <span>{getHeaderDate()}</span>
      </p>
    </div>
  </HeaderContainer>
);

const Footer = () => (
  <div
    style={{
      width: '100%',
      paddingLeft: 24,
      paddingRight: 24,
      paddingBottom: 16,
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <span
      style={{
        fontFamily: 'Red Hat Text, Helvetica, Arial, sans-serif',
        fontSize: 8,
        color: '#6a6e73',
      }}
    >
      Page <span className='pageNumber' />
    </span>
  </div>
);

const HEADER_BASE_STYLE = `<style>
    #header {
        padding: 0 !important;
    }
    * {
      font-family: 'Red Hat Text', Helvetica, Arial, sans-serif;
      font-style: italic;
      font-size: 9px;
      color: #ccc
    }</style>`;

const FOOTER_BASE_STYLE = `<style>
    #footer {
        padding: 0 !important;
    }
    * {
      font-family: 'Red Hat Text', Helvetica, Arial, sans-serif;
      font-style: italic;
      font-size: 9px;
      color: #ccc
    }</style>`;

export function getHeaderAndFooterTemplates(logoSvg?: string): {
  headerTemplate: string;
  footerTemplate: string;
} {
  return {
    headerTemplate: HEADER_BASE_STYLE + renderToStaticMarkup(<Header logoSvg={logoSvg} />),
    footerTemplate: FOOTER_BASE_STYLE + renderToStaticMarkup(<Footer />),
  };
}
