import { getHeaderDate } from './pdfHeader';

describe('getHeaderDate', () => {
  it('formats the date in UTC regardless of local timezone', () => {
    // 2026-08-25T22:30:00Z — late evening UTC, which would be Aug 26 in UTC+2
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-25T22:30:00Z'));

    const result = getHeaderDate();

    expect(result).toContain('25');
    expect(result).toContain('Aug');
    expect(result).toContain('2026');
    expect(result).toContain('22:30');
    expect(result).toContain('UTC');
    // Must NOT contain "26" as the day (that would be the local-time bug)
    expect(result).toBe('25 Aug 2026 22:30 UTC');

    jest.useRealTimers();
  });
});
