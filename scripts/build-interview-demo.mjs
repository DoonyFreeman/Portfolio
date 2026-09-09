import {readFile,writeFile,mkdir,cp,readdir} from 'node:fs/promises'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
const source=process.argv[2], temp=process.argv[3]
if(!source||!temp)throw new Error('Usage: node scripts/build-interview-demo.mjs <interview-prep root> <isolated frontend checkout>')
const json=async file=>JSON.parse(await readFile(file,'utf8'))
const courses=[];let id=0
for(const directory of await readdir(path.join(source,'content/courses'))){
  const folder=path.join(source,'content/courses',directory)
  let metadata;try{metadata=await json(path.join(folder,'metadata.json'))}catch{continue}
  const bank=await json(path.join(folder,'questions.json')).catch(()=>({}))
  const testBank=await json(path.join(folder,'tests.json')).catch(()=>({}))
  const lessons=[]
  for(const lesson of metadata.lessons){
    const questions=[],tests=[]
    for(const concept of lesson.concepts){
      for(const q of bank[lesson.slug]?.[concept.slug]||[])questions.push({...q,id:++id,concept_slug:concept.slug,concept_title:concept.title,anchor:concept.anchor,course_slug:metadata.slug,lesson_slug:lesson.slug})
      for(const [index,q]of(testBank[lesson.slug]?.[concept.slug]||[]).entries())tests.push({...q,slug:`${metadata.slug}-${lesson.slug}-${concept.slug}-${index}`,correct_index:q.correct,concept_slug:concept.slug,concept_title:concept.title,anchor:concept.anchor,course_slug:metadata.slug,course_title:metadata.title,lesson_slug:lesson.slug,lesson_title:lesson.title,bank:'lesson'})
    }
    lessons.push({...lesson,course_slug:metadata.slug,concept_count:lesson.concepts.length,markdown:await readFile(path.join(folder,lesson.file),'utf8'),concepts:lesson.concepts.map(c=>({...c,question_count:questions.filter(q=>q.concept_slug===c.slug).length})),questions,tests})
  }
  courses.push({...metadata,lessons})
}
courses.sort((a,b)=>a.order-b.order)
const data={courses,glossary:await json(path.join(source,'content/glossary.json')),slang:await json(path.join(source,'content/slang.json')),roadmap:await json(path.join(source,'content/roadmap.json'))}
for(const dict of[data.glossary,data.slang])for(const term of dict.terms){term.aliases??=[];term.links??=[]}
await writeFile(path.join(temp,'src/lib/portfolio-data.json'),JSON.stringify(data))
await cp('scripts/demo-adapters/interview-api.ts',path.join(temp,'src/lib/api.ts'))
await writeFile(path.join(temp,'src/lib/token.ts'),'export const getToken=()=>"portfolio-demo"; export const setToken=(_token:string)=>{}; export const clearToken=()=>{};\n')
await writeFile(path.join(temp,'src/components/WhatsNew.tsx'),'export function WhatsNew(){return null}\n')
let main=await readFile(path.join(temp,'src/main.tsx'),'utf8')
main=main.replaceAll('BrowserRouter','HashRouter')
await writeFile(path.join(temp,'src/main.tsx'),main)
// Demo never sends account edits or user text to a real service.
let html=await readFile(path.join(temp,'index.html'),'utf8')
html=html.replace('<head>',`<head><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'none'; frame-src 'none'; form-action 'none'">`)
await writeFile(path.join(temp,'index.html'),html)
const result=path.resolve('public/demos/interview')
await mkdir(result,{recursive:true})
execFileSync(process.execPath,[path.join(temp,'node_modules/vite/bin/vite.js'),'build','--base','./','--outDir',result,'--emptyOutDir'],{cwd:temp,stdio:'inherit',env:{...process.env,VITE_API_BASE:''}})
await writeFile(path.join(result,'demo-manifest.json'),JSON.stringify({mode:'original-ui-local-data',courses:courses.length,lessons:courses.reduce((n,c)=>n+c.lessons.length,0),network:false,aiGrading:false,sourceMaps:false},null,2))
console.log('Original Interview Prep UI exported with local-only demo data.')
