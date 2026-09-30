import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync('config.json', 'utf8'));
const me = cfg.username;

const gql = (query, vars = {}) => {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  for (const [k, v] of Object.entries(vars)) args.push('-F', `${k}=${v}`);
  return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 << 20 })).data;
};

const now = new Date();
const from = new Date(now - 365 * 864e5).toISOString();

const { user } = gql(`query($login:String!,$from:DateTime!){user(login:$login){
  name followers{totalCount}
  contributionsCollection(from:$from){totalCommitContributions totalPullRequestContributions totalIssueContributions totalPullRequestReviewContributions}
  repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100,orderBy:{field:STARGAZERS,direction:DESC}){nodes{
    name stargazerCount forkCount pushedAt
    languages(first:4,orderBy:{field:SIZE,direction:DESC}){totalSize edges{size node{name color}}}}}}}`,
  { login: me, from });

const prs = [];
for (let after = null; ;) {
  const { search } = gql(`query($q:String!,$after:String){search(query:$q,type:ISSUE,first:100,after:$after){
    pageInfo{hasNextPage endCursor}
    nodes{... on PullRequest{additions deletions mergedAt repository{nameWithOwner stargazerCount forkCount primaryLanguage{name}}}}}}`,
    { q: `author:${me} is:pr is:merged is:public -user:${me}`, ...(after && { after }) });
  prs.push(...search.nodes);
  if (!search.pageInfo.hasNextPage) break;
  after = search.pageInfo.endCursor;
}

const byRepo = new Map();
for (const p of prs) {
  const r = byRepo.get(p.repository.nameWithOwner) ?? { ...p.repository, count: 0, add: 0, del: 0, last: '' };
  r.count++; r.add += p.additions; r.del += p.deletions;
  if (p.mergedAt > r.last) r.last = p.mergedAt;
  byRepo.set(r.nameWithOwner, r);
}
const orgs = new Map();
for (const r of byRepo.values()) {
  const o = r.nameWithOwner.split('/')[0];
  orgs.set(o, (orgs.get(o) ?? 0) + r.count);
}

const repos = user.repositories.nodes.filter(r => r.name !== me).slice(0, cfg.topRepositories);
const featured = cfg.featuredContributions.map(n => byRepo.get(n)).filter(Boolean);
const c = user.contributionsCollection;
const ownedStars = user.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

const THEMES = {
  light: { ink: '#1a1a1a', blue: '#3553ff', paper: '#fafaf5', dim: '#8a8a85', pos: '#167244', neg: '#af3540' },
  dark: { ink: '#e6edf3', blue: '#8294ff', paper: '#0d1117', dim: '#6e7681', pos: '#56d88f', neg: '#ff7b86' },
};
const W = 1200, M = 40;
const num = n => n.toLocaleString('en-US');
const day = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const font = readFileSync('assets/fonts/VT323-Regular.ttf').toString('base64');

function render(t) {
  const out = [];
  const px = (x, y, s, size, fill = t.ink, extra = '') =>
    out.push(`<text x="${x}" y="${y}" font-family="VT323" font-size="${size}" fill="${fill}" ${extra}>${esc(s)}</text>`);
  const mono = (x, y, s, size = 13, fill = t.ink, extra = '') =>
    out.push(`<text x="${x}" y="${y}" font-family="DejaVu Sans Mono, Menlo, monospace" font-size="${size}" fill="${fill}" letter-spacing="0.5" ${extra}>${esc(s)}</text>`);
  const rule = y => out.push(`<line x1="${M}" y1="${y}" x2="${W - M}" y2="${y}" stroke="${t.dim}" stroke-width="1.5"/>`);

  let y = 36;
  mono(M, y, 'FIG_000 / PUBLIC BUILDER PROFILE', 12, t.blue);
  mono(W - M, y, `@${me}`, 12, t.ink, 'text-anchor="end"');
  rule(y + 12);
  px(M, y + 84, (user.name ?? me).toUpperCase(), 76, t.blue, 'letter-spacing="4"');
  out.push(`<text x="${M}" y="${y + 120}" font-family="DejaVu Serif, Georgia, serif" font-size="22" fill="${t.ink}">${esc(cfg.tagline)}</text>`);
  mono(M, y + 148, cfg.roles.join(' · ').toUpperCase(), 11);

  y += 196;
  mono(M, y, 'FIG_001 / MERGED OPEN SOURCE PRS', 12, t.ink, 'font-weight="bold"');
  px(M - 6, y + 220, num(prs.length), 300, t.blue);
  out.push(`<text x="${M}" y="${y + 272}" font-family="DejaVu Serif, Georgia, serif" font-size="22" fill="${t.ink}">ACROSS ${num(byRepo.size)} REPOSITORIES · ${num(orgs.size)} ORGANIZATIONS</text>`);
  mono(M, y + 298, `${num(user.followers.totalCount)} followers`, 12, t.blue);
  out.push(`<line x1="800" y1="${y - 14}" x2="800" y2="${y + 300}" stroke="${t.dim}" stroke-dasharray="3 4"/>`);
  mono(830, y, 'FIG_002 / ORGANIZATIONS', 12, t.ink, 'font-weight="bold"');
  const topOrgs = [...orgs].sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = topOrgs[0]?.[1] ?? 1;
  topOrgs.forEach(([o, n], i) => {
    const oy = y + 36 + i * 38;
    mono(830, oy, o, 12);
    out.push(`<rect x="830" y="${oy + 8}" width="${Math.max(4, 260 * n / max)}" height="10" fill="${t.blue}"/>`);
    px(W - M, oy + 18, n, 26, t.blue, 'text-anchor="end"');
  });

  y += 322;
  rule(y);
  const stats = [
    [num(ownedStars), 'OWNED STARS', true], [num(c.totalCommitContributions), 'COMMITS / 365D'],
    [num(c.totalPullRequestContributions), 'PRS / 365D'], [num(c.totalIssueContributions), 'ISSUES / 365D'],
    [num(c.totalPullRequestReviewContributions), 'REVIEWS / 365D'], [num(user.followers.totalCount), 'FOLLOWERS', true],
  ];
  stats.forEach(([v, l, blue], i) => {
    px(M + i * 190, y + 58, v, 48, blue ? t.blue : t.ink);
    mono(M + i * 190, y + 82, l, 10);
  });

  y += 108;
  rule(y);
  mono(M, y + 34, 'FIG_003 / TECH STACK', 13, t.blue, 'font-weight="bold"');
  const bw = (W - 2 * M - 4 * 20) / 5;
  cfg.techStack.slice(0, 5).forEach((s, i) => {
    const x = M + i * (bw + 20);
    out.push(`<rect x="${x}" y="${y + 54}" width="${bw}" height="44" fill="none" stroke="${t.blue}" stroke-width="1.5"/>`);
    px(x + 12, y + 86, s, 30, t.blue);
  });

  y += 124;
  rule(y);
  const cx = 640, colTop = y;
  mono(M, y + 30, `FIG_004 / TOP ${repos.length} REPOSITORIES`, 12, t.ink, 'font-weight="bold"');
  mono(M, y + 56, 'Original public projects · languages by code size', 12);
  let ly = y + 100;
  for (const r of repos) {
    px(M, ly, r.name, 32);
    mono(M, ly + 30, `${num(r.stargazerCount)} STARS / ${num(r.forkCount)} FORKS`, 14);
    const langs = r.languages.edges, total = r.languages.totalSize;
    if (total) {
      let bx = M;
      langs.forEach(({ size, node }, i) => {
        const w = 520 * size / total;
        out.push(`<rect x="${bx}" y="${ly + 46}" width="${w}" height="8" fill="${node.color ?? t.dim}"/>`);
        bx += w;
        const lx = M + (i % 2) * 260, lyy = ly + 78 + Math.floor(i / 2) * 24;
        out.push(`<circle cx="${lx + 5}" cy="${lyy - 4}" r="5" fill="${node.color ?? t.dim}"/>`);
        mono(lx + 18, lyy, `${node.name} ${(100 * size / total).toFixed(1)}%`, 12);
      });
    } else mono(M, ly + 78, 'No language breakdown reported', 12);
    mono(M, ly + 136, `Pushed ${day(r.pushedAt)}`, 12);
    out.push(`<line x1="${M}" y1="${ly + 158}" x2="${M + 520}" y2="${ly + 158}" stroke="${t.dim}"/>`);
    ly += 200;
  }

  out.push(`<line x1="${cx - 40}" y1="${colTop + 14}" x2="${cx - 40}" y2="${colTop + Math.max(repos.length, featured.length) * 200 + 60}" stroke="${t.dim}" stroke-dasharray="3 4"/>`);
  mono(cx, y + 30, 'FIG_005 / SELECTED CONTRIBUTIONS', 12, t.ink, 'font-weight="bold"');
  mono(cx, y + 56, 'Merged PRs to other public repositories', 12);
  let ry = y + 100;
  featured.forEach((r, i) => {
    out.push(`<circle cx="${cx + 6}" cy="${ry - 10}" r="7" fill="none" stroke="${t.blue}" stroke-width="2"/>`);
    if (i < featured.length - 1) out.push(`<line x1="${cx + 6}" y1="${ry}" x2="${cx + 6}" y2="${ry + 180}" stroke="${t.dim}"/>`);
    const name = r.nameWithOwner.length > 32 ? `${r.nameWithOwner.slice(0, 31)}…` : r.nameWithOwner;
    px(cx + 30, ry, name, 30);
    mono(cx + 30, ry + 32, `${r.count} MERGED PR${r.count === 1 ? '' : 'S'} / ALL TIME`, 14, t.blue);
    mono(cx + 30, ry + 52, 'SUM OF MERGED PR DIFFS', 11);
    px(cx + 30, ry + 84, `+${num(r.add)}`, 30, t.pos);
    px(cx + 260, ry + 84, `-${num(r.del)}`, 30, t.neg);
    mono(cx + 30, ry + 110, `${r.primaryLanguage?.name ?? 'n/a'} · ${num(r.stargazerCount)} stars · ${num(r.forkCount)} forks`, 12);
    mono(cx + 30, ry + 138, `Latest merge ${day(r.last)}`, 12);
    ry += 200;
  });

  y = colTop + Math.max(repos.length, featured.length) * 200 + 80;
  rule(y);
  mono(M, y + 28, 'SOURCE / PUBLIC GITHUB DATA', 11);
  mono(W - M, y + 28, `REFRESHED ${day(now)}`, 11, t.ink, 'text-anchor="end"');
  const H = y + 60;
  out.push(`<rect x="0" y="${H - 6}" width="${W}" height="6" fill="${t.blue}"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>@font-face{font-family:VT323;src:url(data:font/ttf;base64,${font})}</style>
<rect width="100%" height="100%" fill="${t.paper}"/>
${out.join('\n')}
</svg>`;
}

mkdirSync('build', { recursive: true });
for (const [name, t] of Object.entries(THEMES)) writeFileSync(`build/card-${name}.svg`, render(t));
console.log(`merged PRs: ${prs.length}, repos: ${byRepo.size}, featured: ${featured.length}`);
