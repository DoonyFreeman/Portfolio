export const API_BASE_URL = ''
export class ApiError extends Error { constructor(public status:number,message:string,public detail?:unknown){super(message);this.name='ApiError'} }
const documents=[
 ['project-brief.pdf','Техническое задание: веб-сервис поиска по документам. Поиск помогает быстро найти нужный раздел базы знаний.'],
 ['architecture.docx','Архитектура приложения: React для интерфейса, FastAPI для API, Elasticsearch для полнотекстового поиска и Redis для кэша.'],
 ['landscape-guide.pdf','Ландшафтный проект: композиция растений, освещение и полив. План участка помогает сравнить варианты посадки.'],
 ['interview-notes.docx','Подготовка к собеседованию: Python, базы данных, API и асинхронность. Теория закрепляется практическими вопросами.'],
 ['search-quality.pdf','Качество поиска: релевантность, подсветка совпадений и постраничная выдача. Поиск по PDF и DOCX.'],
]
export async function apiRequest<T>(path:string,_options?:unknown):Promise<T>{
 if(path.startsWith('/documents'))throw new ApiError(403,'В демоверсии загрузка отключена. Используйте поиск по готовым примерам: «поиск», «React», «растения».')
 if(path.startsWith('/health'))return {status:'ok',service:'portfolio-demo',version:'demo'} as T
 const params=new URLSearchParams(path.split('?')[1]),q=(params.get('q')||'').trim().toLowerCase()
 const hits=documents.filter(([name,text])=>(name+' '+text).toLowerCase().includes(q)).map(([name,text],i)=>({chunk_id:String(i),file_name:name,page:1,text,score:1,highlight:null}))
 const offset=Number(params.get('offset')||0),limit=Number(params.get('limit')||10)
 return {total:hits.length,results:hits.slice(offset,offset+limit)} as T
}
