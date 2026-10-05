export interface LinkInfo {
  href: string;
  /** Hostname without "www.", for display. */
  host: string;
  kind: 'video' | 'web';
}

const VIDEO_HOSTS = ['tiktok.com', 'youtube.com', 'youtu.be', 'instagram.com', 'vimeo.com', 'facebook.com'];

/**
 * Describe a stored recipe link for display. Returns undefined for anything that
 * is not a plain http(s) URL, so a bad value can never become a javascript: link.
 */
export function describeLink(raw: string | undefined): LinkInfo | undefined {
  if (!raw) return undefined;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
  const host = url.hostname.replace(/^www\./, '');
  const kind = VIDEO_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ? 'video' : 'web';
  return { href: url.href, host, kind };
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
