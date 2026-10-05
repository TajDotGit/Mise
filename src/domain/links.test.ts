import { describeLink, formatMinutes } from './links';

describe('describeLink', () => {
  it('recognizes video sites', () => {
    expect(describeLink('https://www.tiktok.com/@someone/video/123')).toEqual({
      href: 'https://www.tiktok.com/@someone/video/123',
      host: 'tiktok.com',
      kind: 'video',
    });
    expect(describeLink('https://m.youtube.com/watch?v=abc')?.kind).toBe('video');
  });

  it('treats other sites as web links', () => {
    expect(describeLink('https://www.example.com/recipe')).toMatchObject({ host: 'example.com', kind: 'web' });
  });

  it('never returns a non-http link', () => {
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,hi', 'vbscript:x', 'not a url', '']) {
      expect(describeLink(bad)).toBeUndefined();
    }
  });

  it('does not treat look-alike hosts as video sites', () => {
    expect(describeLink('https://nottiktok.com/x')?.kind).toBe('web');
  });
});

describe('formatMinutes', () => {
  it.each([
    [25, '25 min'],
    [60, '1 hr'],
    [75, '1 hr 15 min'],
  ])('%s -> %s', (m, s) => expect(formatMinutes(m)).toBe(s));
});
