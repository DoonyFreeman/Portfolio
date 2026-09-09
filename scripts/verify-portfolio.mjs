import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const source = await readFile('src/data/caseStudies.ts', 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const data = {}
new Function('exports', compiled)(data)
const publicRepos = new Set(['Console_upscaler', 'BackendLearning', 'WebSocket_Messenger', 'redis-kafka', 'Wordle_Game_Wibecode'])
assert.equal(new Set(data.caseStudies.map(p => p.id)).size, data.caseStudies.length, 'Unique project IDs')
assert(data.caseStudies.some(p => p.id === 'masterstroy'), 'Masterstroy is included')
assert(!/erp[-_ ]?master/i.test(source), 'Excluded project must not appear in published content')
assert(!/\/Users\/|localhost|127\.0\.0\.1/.test(source), 'No local addresses in project data')
for (const project of data.caseStudies) {
  for (const field of ['title', 'summary', 'challenge', 'solution', 'result']) assert(project[field]?.trim(), `${project.id}: ${field}`)
  if (project.source) {
    const url = new URL(project.source)
    assert.equal(url.origin, 'https://github.com')
    assert(publicRepos.has(url.pathname.split('/')[2]), `Only verified public repos may be linked: ${project.id}`)
  }
  if (project.website) assert.equal(new URL(project.website).protocol, 'https:')
}
const demoRoot = path.join(root, 'public/demos/masterstroy')
const manifest = JSON.parse(await readFile(path.join(demoRoot, 'manifest.json'), 'utf8'))
for (const file of Object.values(manifest.routes)) {
  const html = await readFile(path.join(demoRoot, file), 'utf8')
  assert(!/<form\b|<iframe\b/i.test(html), `${file}: forms and embedded third parties removed`)
  assert(!/data-cookie-consent-script=/i.test(html), `${file}: no tracking script`)
  assert(html.includes("connect-src 'none'") && html.includes("form-action 'none'"), `${file}: read-only policy`)
  for (const match of html.matchAll(/\b(?:href|src)="([^"#]+)"/g)) {
    const url = match[1].split(/[?#]/)[0]
    if (/^[a-z]+:/i.test(url) || url.startsWith('//')) continue
    assert(!url.startsWith('/'), `${file}: root URL would break GitHub Pages base path`)
    if (url) await access(path.join(demoRoot, url))
  }
}
const app = await readFile('src/components/Showcase.tsx', 'utf8')
for (const match of app.matchAll(/asset\('([^']+)'\)/g)) await access(path.join(root, 'public/projects', match[1]))
const output = await readFile('dist/index.html', 'utf8')
for (const match of output.matchAll(/(?:src|href)="(\/Portfolio\/[^"?#]+)"/g)) await access(path.join(root, 'dist', match[1].replace('/Portfolio/', '')))
assert(output.includes('/Portfolio/assets/'), 'Production build uses the GitHub Pages base path')
console.log(`Verified ${data.caseStudies.length} cases, public source allowlist, ${Object.keys(manifest.routes).length} read-only demo pages, local resources and production base path.`)
