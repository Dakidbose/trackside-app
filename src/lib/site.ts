// Reads picks straight from tracksideselections.com. The site is static HTML built by the
// scripts in the trackside-selections repo (_tools/*.py), so the parsers below follow that markup.
// If the site's card layout changes, update the regexes here.

export const SITE = 'https://tracksideselections.com';

export type Selection = { program: string; horse: string; ml: string };

export type Race = {
  number: number;
  /** "cashed" (top pick won), "missed", or "" (pending / other) */
  status: 'cashed' | 'missed' | '';
  badge: string;
  badgeKind: string; // cash | miss | pend
  selections: Selection[];
  postTime?: string; // e.g. "4:00 PM PT"
  conditions?: string; // e.g. "1 1/16M Dirt"
  official?: string; // "Official: 3-2-4-6. ..."
  notes: string[];
};

export type StrongPlay = {
  race: number;
  postTime?: string;
  label: string; // "Best bet", "Price play"
  selection?: Selection;
  reason?: string;
  result?: string;
};

export type Card = {
  file: string; // charles-town-2026-11-19.html
  track: string;
  date: string; // YYYY-MM-DD
  heading: string;
  meta: string[];
  summary?: string;
  strongest: StrongPlay[];
  races: Race[];
};

export type CardRef = { file: string; track: string; date: string };

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…',
};

export function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

export function text(html: string): string {
  return decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

/** "charles-town-2026-11-19.html" -> { track: "Charles Town", date: "2026-11-19" } */
export function refFromFile(file: string): CardRef | null {
  const m = file.match(/^([a-z0-9-]+)-(\d{4}-\d{2}-\d{2})\.html$/);
  if (!m) return null;
  const track = m[1]
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { file, track, date: m[2] };
}

async function get(path: string): Promise<string> {
  const res = await fetch(`${SITE}${path}`, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) throw new Error(`Could not load ${path} (HTTP ${res.status})`);
  return res.text();
}

function splitRaces(html: string): string[] {
  // Each race tile starts with <div class="rc ..."> (but not rc-head, rc-chips, ...).
  const starts: number[] = [];
  const re = /<div class="rc(?: [a-z]*)? ?">/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) starts.push(m.index);
  return starts.map((s, i) => html.slice(s, starts[i + 1] ?? html.length));
}

function parseSelections(block: string): Selection[] {
  const out: Selection[] = [];
  const re = /<span class="pn s\w*">(\w+)<\/span><span class="rc-horse">([^<]*)<\/span>(?:<span class="rc-ml">([^<]*)<\/span>)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) out.push({ program: m[1], horse: decode(m[2]), ml: decode(m[3] ?? '').replace(/^ML\s*/, '') });
  if (out.length) return out;
  // Older cards (before Nov 7, 2026) list program numbers only.
  const chips = block.match(/<div class="rc-chips">([\s\S]*?)<\/div>/)?.[1] ?? '';
  for (const c of chips.matchAll(/<span class=["']pn s\w*["']>(\w+)<\/span>/g)) out.push({ program: c[1], horse: '', ml: '' });
  return out;
}

function paragraphs(block: string): string[] {
  return [...block.matchAll(/<p class="rc-res">([\s\S]*?)<\/p>/g)].map((m) => m[1]);
}

export function parseCard(file: string, html: string): Card {
  const ref = refFromFile(file) ?? { file, track: file, date: '' };
  const secStart = html.indexOf('<section class="cpicks"');
  const sec = secStart >= 0 ? html.slice(secStart, html.indexOf('</section>', secStart)) : html;

  const heading = text(sec.match(/<h2>([\s\S]*?)<\/h2>/)?.[1] ?? `${ref.track} · ${ref.date}`);
  const meta = [...sec.matchAll(/<p class="meta">([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
  const summaryRaw = sec.match(/<p class="disclaimer gradesum"[^>]*>([\s\S]*?)<\/p>/)?.[1];
  const summary = summaryRaw ? text(summaryRaw).replace(/^⚠\s*/, '') : undefined;

  const allIdx = sec.search(/<h3>All races<\/h3>/);
  const strongIdx = sec.indexOf('id="strongest"');
  const strongHtml = strongIdx >= 0 ? sec.slice(strongIdx, allIdx >= 0 ? allIdx : undefined) : '';
  const racesHtml = allIdx >= 0 ? sec.slice(allIdx) : sec;

  const strongest: StrongPlay[] = splitRaces(strongHtml).map((b) => {
    const head = b.match(/<span class="rc-num">Race (\d+)(?:\s*·\s*([^<]+))?<\/span>/);
    const label = text(b.match(/<span class="badge \w+">([^<]*)<\/span>/)?.[1] ?? '');
    const ps = paragraphs(b).map(text);
    const result = ps.find((p) => p.startsWith('Result:'));
    return {
      race: Number(head?.[1] ?? 0),
      postTime: head?.[2] ? decode(head[2]).trim() : undefined,
      label,
      selection: parseSelections(b)[0],
      reason: ps.find((p) => !p.startsWith('Result:')),
      result,
    };
  });

  const races: Race[] = splitRaces(racesHtml)
    .map((b): Race | null => {
      const num = b.match(/<span class="rc-num">Race (\d+)/);
      if (!num) return null;
      const cls = b.match(/^<div class="rc ?([a-z]*)/)?.[1] ?? '';
      const badge = b.match(/<span class="badge (\w+)">([^<]*)<\/span>/);
      const ps = paragraphs(b);
      let postTime: string | undefined;
      let conditions: string | undefined;
      let official: string | undefined;
      const notes: string[] = [];
      for (const p of ps) {
        const post = p.match(/<b>post ([^<]+)<\/b>(?:\s*·\s*([\s\S]*))?/);
        if (post) {
          postTime = decode(post[1]).trim();
          conditions = post[2] ? text(post[2]) : undefined;
          continue;
        }
        const t = text(p);
        if (t.startsWith('Official:')) official = t;
        else if (t) notes.push(t);
      }
      return {
        number: Number(num[1]),
        status: cls === 'cashed' || cls === 'missed' ? cls : '',
        badgeKind: badge?.[1] ?? 'pend',
        badge: text(badge?.[2] ?? ''),
        selections: parseSelections(b),
        postTime,
        conditions,
        official,
        notes,
      };
    })
    .filter((r): r is Race => r !== null);

  return { ...ref, heading, meta, summary, strongest, races };
}

/** Today's cards, as listed by the latest-card block on /picks/. */
export async function fetchTodayRefs(): Promise<CardRef[]> {
  const html = await get('/picks/index.html');
  const files = html.match(/data-card="([^"]+)"/)?.[1].split(/\s+/).filter(Boolean) ?? [];
  return files.map(refFromFile).filter((r): r is CardRef => r !== null);
}

export async function fetchCard(file: string): Promise<Card> {
  if (!/^[a-z0-9-]+\.html$/.test(file)) throw new Error('Unknown picks card');
  return parseCard(file, await get(`/picks/${file}`));
}

/** Past cards from /picks/archive.html plus any dated cards linked on /picks/, newest first. */
export async function fetchArchiveRefs(): Promise<CardRef[]> {
  const [archive, index] = await Promise.all([get('/picks/archive.html'), get('/picks/index.html').catch(() => '')]);
  const seen = new Set<string>();
  const refs: CardRef[] = [];
  for (const src of [index, archive]) {
    for (const m of src.matchAll(/href="(?:\/picks\/)?([a-z0-9-]+-\d{4}-\d{2}-\d{2}\.html)"/g)) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      const r = refFromFile(m[1]);
      if (r) refs.push(r);
    }
  }
  return refs.sort((a, b) => (a.date === b.date ? a.track.localeCompare(b.track) : b.date.localeCompare(a.date)));
}

export type Guide = { path: string; title: string; blurb: string };

export async function fetchGuides(): Promise<Guide[]> {
  const html = await get('/handicapping-guides.html');
  const out: Guide[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a[^>]+href="\/?(articles\/[a-z0-9-]+\.html)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const title = text(m[2].match(/<h3>([\s\S]*?)<\/h3>/)?.[1] ?? m[2]);
    const blurb = text(m[2].match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? '');
    out.push({ path: `/${m[1]}`, title, blurb });
  }
  return out;
}
