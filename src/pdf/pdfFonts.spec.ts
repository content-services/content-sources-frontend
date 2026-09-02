import { getFontLinkTag } from './pdfFonts';

const TEST_BASE_URL = 'http://127.0.0.1:3001/pdf/styles';

describe('pdfFonts', () => {
  describe('getFontLinkTag', () => {
    it('returns a <link> tag pointing to pdf-fonts.css', () => {
      const tag = getFontLinkTag(TEST_BASE_URL);

      expect(tag).toContain('<link');
      expect(tag).toContain('rel="stylesheet"');
      expect(tag).toContain(`${TEST_BASE_URL}/pdf-fonts.css`);
    });
  });
});
