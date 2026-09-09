// Adapter for an isolated portfolio build. No requests leave the browser.
import axios from 'axios'
import data from './portfolio-data.json'

const db: any = data
const completed = new Set<string>()
const attempts: Record<number, any[]> = {}
const testResults: Record<string, Record<string, boolean>> = {}
let pet = { name: 'Байт', skin: 'classic', hat: null, streak: 1, best_streak: 1, last_active_day: '2026-09-09', hidden: false }
let user = { id: 1, email: 'visitor@example.com', display_name: 'Гость портфолио', created_at: '2026-09-09T00:00:00Z', is_admin: false }
const questions = db.courses.flatMap((c: any) => c.lessons.flatMap((l: any) => l.questions))
const tests = db.courses.flatMap((c: any) => c.lessons.flatMap((l: any) => l.tests))
const courseBy = (slug: string) => db.courses.find((c: any) => c.slug === slug)
const lessonBy = (course: string, lesson: string) => courseBy(course)?.lessons.find((l: any) => l.slug === lesson)
const progress = () => {
  const courses = db.courses.map((c: any) => ({ slug: c.slug, title: c.title, lessons: c.lessons.map((l: any) => ({ slug: l.slug, title: l.title, completed: completed.has(c.slug+'/'+l.slug), total_concepts: l.concepts.length, attempted_concepts: 0, mastered_concepts: 0, due_concepts: 0, concepts: l.concepts.map((concept: any) => ({ ...concept, attempted: false, mastered: false, reps: 0, last_score: 0, due_at: null, due: false })) })), total_concepts: c.lessons.reduce((n: number,l: any) => n+l.concepts.length,0), attempted_concepts:0, mastered_concepts:0, due_concepts:0 }))
  return { courses, total_concepts: courses.reduce((n:number,c:any)=>n+c.total_concepts,0), attempted_concepts:0, mastered_concepts:0, due_concepts:0 }
}
const testProgress = (key: string, total = 0) => {
  const values = Object.values(testResults[key] || {})
  const correct = values.filter(Boolean).length
  const score = values.length ? Math.round(correct/values.length*100) : 0
  return { total, answered:values.length, correct, attempts:values.length?1:0, last_score:score, best_score:score, passed:values.length>=total && total>0 && score>=70 }
}
let glossaryStats: any[] = []
const glossaryProgress = () => ({ total:db.glossary.terms.length, seen:glossaryStats.length, mastered:glossaryStats.filter(t=>t.mastered).length, recorded:glossaryStats.length, terms:glossaryStats, categories:db.glossary.categories.map((category:string)=>({category,total:db.glossary.terms.filter((t:any)=>t.category===category).length,seen:0,mastered:0})) })
export function handleDemoRequest(raw: string, method='get', body: any={}, params: any={}) {
  const url = new URL(raw, 'https://demo.invalid')
  const path = url.pathname
  const p = { ...Object.fromEntries(url.searchParams), ...params }
  if (path === '/auth/me') { if(method==='patch') user={...user,...body}; return user }
  if (path === '/auth/login' || path === '/auth/register') return { access_token:'portfolio-demo', token_type:'bearer' }
  if (path === '/auth/password') throw new Error('В демоверсии пароль не требуется.')
  if (path === '/courses') return db.courses.map(({lessons,...c}:any)=>({...c,lesson_count:lessons.length}))
  const lessonMatch = path.match(/^\/courses\/([^/]+)\/lessons\/([^/]+)$/)
  if (lessonMatch) return lessonBy(lessonMatch[1], lessonMatch[2])
  const courseMatch=path.match(/^\/courses\/([^/]+)$/)
  if(courseMatch) return courseBy(courseMatch[1])
  if(path==='/progress') return progress()
  if(path==='/progress/review') return { count:0, items:[] }
  if(path==='/progress/questions') return {total:questions.length,answered:Object.keys(attempts).length,courses:db.courses.map((c:any)=>({slug:c.slug,title:c.title,total:c.lessons.reduce((n:number,l:any)=>n+l.questions.length,0),answered:0,lessons:c.lessons.map((l:any)=>({slug:l.slug,title:l.title,total:l.questions.length,answered:l.questions.filter((q:any)=>attempts[q.id]?.length).length}))}))}
  const mark=path.match(/^\/progress\/courses\/([^/]+)\/lessons\/([^/]+)$/)
  if(mark){const key=mark[1]+'/'+mark[2];body.completed?completed.add(key):completed.delete(key);return {completed:completed.has(key)}}
  if(path==='/pet'){if(method==='patch')pet={...pet,...body};return pet}
  if(path==='/pet/visit')return pet
  if(path==='/cat/thoughts')return []
  if(path==='/roadmap')return db.roadmap
  if(path==='/glossary'){
    const source=p.kind==='slang'?db.slang:db.glossary
    const terms=source.terms.filter((t:any)=>(!p.category||t.category===p.category)&&(!p.q||JSON.stringify(t).toLowerCase().includes(p.q.toLowerCase())))
    return {...source,count:terms.length,terms}
  }
  if(path==='/glossary/progress')return glossaryProgress()
  if(path==='/glossary/quiz/result'){glossaryStats=[...glossaryStats,...body.items.map((item:any)=>({term_slug:item.term_slug,seen:1,correct:item.correct?1:0,last_correct:item.correct,mastered:item.correct,last_seen_at:new Date().toISOString()}))];return glossaryProgress()}
  if(path==='/search'){
    const q=(p.q||'').toLowerCase(); const results=db.courses.flatMap((c:any)=>c.lessons.filter((l:any)=>`${l.title} ${l.markdown}`.toLowerCase().includes(q)).map((l:any)=>({course_slug:c.slug,course_title:c.title,lesson_slug:l.slug,lesson_title:l.title,section_title:null,anchor:'',snippet:l.markdown.slice(0,180),match_field:'body'}))).slice(0,30)
    return {query:p.q,count:results.length,results}
  }
  if(path==='/quiz/tests/overview')return {total:db.courses.reduce((n:number,c:any)=>n+c.lessons.length,0),passed:0,started:Object.keys(testResults).length,courses:db.courses.map((c:any)=>({slug:c.slug,total:c.lessons.length,passed:0,started:0}))}
  if(path==='/quiz/tests/topics')return {total:tests.length,lesson_total:tests.length,exam_total:0,answered:0,weak:0,topics:db.courses.map((c:any)=>{const total=c.lessons.reduce((n:number,l:any)=>n+l.tests.length,0);return{slug:c.slug,title:c.title,total,lesson_total:total,exam_total:0,answered:0,weak:0}})}
  if(path==='/quiz/tests/mix'){const pool=tests.filter((q:any)=>!p.courses||p.courses.split(',').includes(q.course_slug));const selected=[...pool].sort(()=>Math.random()-.5).slice(0,Number(p.count)||10);return {count:selected.length,pool:pool.length,questions:selected}}
  if(path==='/quiz/tests/mix/result')return{recorded:body.items.length,correct:body.items.filter((x:any)=>x.correct).length}
  const quiz=path.match(/^\/quiz\/courses\/([^/]+)\/lessons\/([^/]+)\/(.+)$/)
  if(quiz){const l=lessonBy(quiz[1],quiz[2]), action=quiz[3],key=quiz[1]+'/'+quiz[2]
    if(action==='next')return l.questions[0]
    if(action==='questions')return{course_slug:quiz[1],lesson_slug:quiz[2],questions:l.questions.map((q:any)=>({...q,attempts:attempts[q.id]?.length||0,last_score:null,last_verdict:null,last_attempted_at:null}))}
    if(action==='test')return{course_slug:quiz[1],lesson_slug:quiz[2],total:l.tests.length,questions:l.tests}
    if(action==='test/progress')return testProgress(key,l.tests.length)
    if(action==='test/result'){testResults[key]={...(testResults[key]||{}),...Object.fromEntries(body.items.map((x:any)=>[x.slug,x.correct]))};return testProgress(key,l.tests.length)}
  }
  const question=path.match(/^\/quiz\/questions\/(\d+)(?:\/(.+))?$/)
  if(question){const q=questions.find((q:any)=>q.id===Number(question[1]));const action=question[2]
    if(!action)return q
    if(action==='hint')return{hint:'Демонстрационная подсказка: вернитесь к определению в теории и сопоставьте его с вопросом. ИИ в этой версии не вызывается.'}
    if(action==='attempts')return{...q,question_id:q.id,attempts:attempts[q.id]||[]}
    if(action==='evaluate'){const evaluation={attempt_id:Date.now(),score:0,verdict:'Демо-разбор',summary:'ИИ-оценка в портфолио отключена. Ниже — настоящий эталон из учебного материала для самостоятельного сравнения.',strengths:[],gaps:[],suggestion:'Сравните свой ответ с эталоном. Числовая оценка в этом режиме не выставляется.',reference_answer:q.reference_answer,concept_slug:q.concept_slug,mastery:{reps:0,ease:2.5,interval_days:0,last_score:0,due_at:new Date().toISOString(),due:false}};attempts[q.id]=[...(attempts[q.id]||[]),{...evaluation,id:evaluation.attempt_id,answer_text:body.answer_text,hint_used:body.hint_used,created_at:new Date().toISOString()}];return evaluation}
  }
  throw new Error('Этот серверный сценарий не подключён в демоверсии.')
}
export const api=axios.create({adapter:async config=>{
  try {const body=typeof config.data==='string'?JSON.parse(config.data):config.data||{};return{data:handleDemoRequest(config.url||'/',config.method,body,config.params),status:200,statusText:'OK',headers:{},config}}
  catch(error){throw new Error(error instanceof Error?error.message:'Недоступно в демоверсии')}
}})
export const apiErrorMessage=(error:unknown,fallback:string)=>error instanceof Error?error.message:fallback
