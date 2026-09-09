/** Export public, read-only presentation pages. Never reads private source or credentials. */
import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const origin = 'https://masterstroy44.ru'
const destination = path.resolve('public/demos/masterstroy')
const routes = new Map([
  ['/', 'index.html'], ['/projects/', 'projects.html'],
  ['/projects/geometriya/', 'geometriya.html'], ['/projects/lesnoy-kvartal/', 'lesnoy.html'],
  ['/apartments/', 'apartments.html'], ['/mortgage/', 'mortgage.html'], ['/about/', 'about.html'],
])
const assets = new Map()
await mkdir(path.join(destination, 'assets'), { recursive: true })
async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) })
  if (!response.ok) throw new Error(`${response.status}: ${url}`)
  if (new URL(response.url).origin !== origin) throw new Error('Unexpected redirect')
  return response
}
async function asset(raw, kind) {
  const url = new URL(raw.replaceAll('&amp;', '&'), origin).href
  if (new URL(url).origin !== origin) throw new Error('Unexpected asset origin')
  if (assets.has(url)) return assets.get(url)
  const ext = kind || path.extname(new URL(url).pathname).slice(1)
  const name = `assets/${createHash('sha256').update(url).digest('hex').slice(0, 16)}.${ext}`
  assets.set(url, name)
  const response = await request(url)
  if (ext === 'css') {
    let css = await response.text()
    const matches = [...css.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g)]
    for (const match of matches) {
      if (/^(data:|#)/.test(match[2])) continue
      const resolved = new URL(match[2], url).href
      let replacement = resolved
      if (/\.(woff2?|ttf|otf)(\?|$)/i.test(resolved)) {
        const local = await asset(resolved)
        replacement = path.basename(local)
      }
      css = css.replaceAll(match[0], `url("${replacement}")`)
    }
    await writeFile(path.join(destination, name), css)
  } else await writeFile(path.join(destination, name), Buffer.from(await response.arrayBuffer()))
  return name
}
const guard = `
document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();notice('Это демонстрация. Заявки не отправляются.');},true);
function notice(text){document.getElementById('portfolio-notice').textContent=text;}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const value=a.getAttribute('href')||'';if(a.hasAttribute('data-unavailable')){e.preventDefault();e.stopImmediatePropagation();notice('В демонстрацию включены главная, проекты, квартиры, ипотека и страница компании. Выберите раздел в панели сверху.');return;}if(value.startsWith('#'))return;const u=new URL(value,location.href);if(u.origin!==location.origin||!u.pathname.endsWith('.html')){e.preventDefault();e.stopImmediatePropagation();}},true);
`
for (const [route, file] of routes) {
  let html = await (await request(origin + route)).text()
  // Keep only inert JSON and the site's public UI bundle. No counters, consent scripts or inline JS.
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  for (const match of scripts) {
    if (/type=["']application\/json["']/i.test(match[1])) continue
    const src = match[1].match(/\bsrc=["']([^"']+)["']/i)?.[1]
    if (src?.startsWith('/bitrix/cache/js/')) {
      html = html.replace(match[0], `<script defer src="${await asset(src, 'js')}"></script>`)
    } else html = html.replace(match[0], '')
  }
  for (const match of [...html.matchAll(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]) {
    if (/\.css(?:\?|$)/.test(match[1])) html = html.replace(match[0], `<link rel="stylesheet" href="${await asset(match[1], 'css')}">`)
    else html = html.replace(match[0], '')
  }
  html = html.replace(/<base\b[^>]*>/gi, '').replace(/<meta\b[^>]*http-equiv=["']refresh["'][^>]*>/gi, '')
  html = html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
  html = html.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '<p class="portfolio-form-note">Демонстрационная версия. Отправка заявок отключена.</p>')
  html = html.replace(/\s+on[a-z]+=(?:"[^"]*"|'[^']*')/gi, '')
  html = html.replace(/\b(src|poster|data-src)=(['"])(\/(?!\/)[^'"]*)\2/gi, (_, attr, quote, url) => `${attr}=${quote}${origin}${url}${quote}`)
  html = html.replace(/url\((['"]?)(\/(?!\/)[^)'"\s]+)\1\)/gi, (_, quote, url) => `url(${quote}${origin}${url}${quote})`)
  html = html.replace(/\bsrcset=(['"])(.*?)\1/gi, (_, quote, value) => `srcset=${quote}${value.replace(/(^|,\s*)(\/[^\s,]+)/g, '$1'+origin+'$2')}${quote}`)
  html = html.replace(/<a\b([^>]*?)href=(['"])(.*?)\2([^>]*)>/gi, (_, before, quote, href, after) => {
    before = before.replace(/\btarget=(['"])[^'"]*\1/gi, '')
    after = after.replace(/\btarget=(['"])[^'"]*\1/gi, '')
    if (href.startsWith('#')) return `<a ${before}href="${href}"${after}>`
    try {
      const url = new URL(href.replaceAll('&amp;', '&'), origin + route)
      const normalized = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/'
      if (url.origin === origin && routes.has(normalized)) return `<a ${before}href="${routes.get(normalized)}${url.search}${url.hash}"${after}>`
    } catch { /* unavailable destination */ }
    return `<a ${before}href="#" data-unavailable${after}>`
  })
  const policy = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src https://masterstroy44.ru data:; font-src 'self'; connect-src 'none'; frame-src 'none'; media-src 'none'; form-action 'none'; base-uri 'none'"
  html = html.replace(/<head[^>]*>/i, `<head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="robots" content="noindex,nofollow"><style>.portfolio-form-note{padding:20px;font:14px/1.5 sans-serif;color:#666}#portfolio-notice{position:fixed;z-index:2147483647;bottom:12px;left:12px;right:12px;max-width:600px;padding:12px 18px;background:#20251eee;color:#fff;border-radius:10px;font:12px/1.5 sans-serif;pointer-events:none}#portfolio-notice:empty{display:none}</style><script>${guard}</script>`)
  html = html.replace(/<\/body>/i, '<div id="portfolio-notice" role="status"></div></body>')
  await writeFile(path.join(destination, file), html)
  console.log(`Exported ${route} → ${file}`)
}
await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({ source: origin, exportedAt: new Date().toISOString().slice(0, 10), mode: 'read-only-public-snapshot', routes: Object.fromEntries(routes) }, null, 2)+'\n')
console.log(`Saved ${routes.size} public pages and ${assets.size} assets. No backend or private source included.`)
