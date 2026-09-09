import {readFile,writeFile,cp,mkdir} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import path from 'node:path'
const temp=process.argv[2]
if(!temp)throw new Error('Pass an isolated DocFind frontend checkout with installed dependencies')
await cp('scripts/demo-adapters/docfind-api.ts',path.join(temp,'src/services/apiClient.ts'))
const header=path.join(temp,'src/components/layout/AppHeader.tsx')
await writeFile(header,(await readFile(header,'utf8')).replace('{docCount} док.','5 демо').replace('>АК</span>','>Д</span>'))
const main=path.join(temp,'src/main.tsx')
await writeFile(main,(await readFile(main,'utf8')).replaceAll('BrowserRouter','HashRouter'))
const app=path.join(temp,'src/App.tsx')
await writeFile(app,(await readFile(app,'utf8')).replaceAll('to="/upload"','to="/search"'))
const html=path.join(temp,'index.html')
await writeFile(html,(await readFile(html,'utf8')).replace('<head>',`<head><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; form-action 'none'">`))
const out=path.resolve('public/demos/docfind')
await mkdir(out,{recursive:true})
execFileSync(process.execPath,[path.join(temp,'node_modules/vite/bin/vite.js'),'build','--base','./','--outDir',out,'--emptyOutDir'],{cwd:temp,stdio:'inherit'})
await writeFile(path.join(out,'demo-manifest.json'),JSON.stringify({mode:'original-ui-local-data',network:false,uploads:false,documents:5,sourceMaps:false},null,2))
