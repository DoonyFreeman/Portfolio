import {cp,readFile,writeFile,mkdir,mkdtemp,symlink,readdir,realpath} from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {build} from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
const kind=process.argv[2],source=process.argv[3]
if(!['chai','autoimport','servicehub'].includes(kind)||!source)throw new Error('Usage: node scripts/build-site-demo.mjs <chai|autoimport|servicehub> <frontend root>')
const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'portfolio-site-')))
for(const folder of ['app','components','lib'])await cp(path.join(source,folder),path.join(temp,folder),{recursive:true})
await cp(path.join(source,'public'),path.join(temp,'public'),{recursive:true}).catch(()=>{})
await symlink(path.resolve('node_modules'),path.join(temp,'node_modules'))
await cp('scripts/demo-adapters/site-navigation.tsx',path.join(temp,'navigation.tsx'))
await writeFile(path.join(temp,'image.tsx'),"export {Image as default} from './navigation'\n")
const replacements=kind==='chai'?['lib/graphql/queries.ts','chai-data.ts']:kind==='autoimport'?['lib/queries.ts','auto-data.ts']:['lib/api/companies.ts','service-data.ts']
await cp('scripts/demo-adapters/'+replacements[1],path.join(temp,replacements[0]))
// Mechanical adaptations only in the temporary copy; original projects are untouched.
async function adapt(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await adapt(file);else if(/\.(tsx?|css)$/.test(file)){let text=await readFile(file,'utf8');text=text.replaceAll("'/design/","'./design/").replaceAll('"/design/','"./design/').replaceAll('Стол забронирован','Демонстрация бронирования').replaceAll('Менеджер подтвердит бронь и пришлёт письмо на','Данные не отправлены. Это пример подтверждения для').replaceAll('Заявка отправлена','Демо-заявка готова').replaceAll('Менеджер свяжется с вами в ближайшее время.','Данные остались в браузере. Реальная заявка не отправлялась.');await writeFile(file,text)}}}
await adapt(path.join(temp,'app'));await adapt(path.join(temp,'components'))
let imports,render,shell
if(kind==='chai'){
 imports=`import Home from './app/page';import Menu from './app/menu/page';import Ceremonies from './app/ceremonies/page';import Locations from './app/locations/page';import Location from './app/locations/[slug]/page';import Reservation from './app/reservation/page';import {Navbar,Footer} from './components/ds';import{locations}from './lib/graphql/queries';`
 render=`pathname==='/menu'?Menu():pathname==='/ceremonies'?Ceremonies():pathname==='/locations'?Locations():pathname.startsWith('/locations/')?Location({params:Promise.resolve({slug:pathname.split('/')[2]})}):pathname==='/reservation'?Reservation():Home()`
 shell=`<Navbar/>{content}<Footer locations={locations}/>`
}else if(kind==='autoimport'){
 imports=`import Home from './app/page';import Catalog from './app/catalog/page';import Car from './app/cars/[slug]/page';import Navbar from './components/Navbar';import Footer from './components/Footer';`
 render=`pathname==='/catalog'?Catalog({searchParams:Promise.resolve(params)}):pathname.startsWith('/cars/')?Car({params:Promise.resolve({slug:pathname.split('/')[2]})}):Home()`
 shell=`<Navbar/><main>{content}</main><Footer/>`
}else{
 await writeFile(path.join(temp,'lib/seo/company-jsonld.ts'),'export const buildCompanyJsonLd=()=>({}); export const companyUrl=(slug:string)=>"#company/"+slug;')
 imports=`import Home from './app/page';import Search from './app/search/page';import Company from './app/company/[slug]/page';import{BookingForm}from './components/BookingForm';import{companies}from './lib/api/companies';`
 render=`pathname==='/search'?Search({searchParams:Promise.resolve(params)}):pathname.startsWith('/company/')?Company({params:Promise.resolve({slug:pathname.split('/')[2]})}):pathname.startsWith('/booking/')?<main className="container section"><h1>Демонстрация записи</h1><BookingForm serviceId={Number(pathname.split('/')[2])} serviceTitle="Консультация" companyTitle="Демо-компания"/></main>:pathname==='/confirmation'?<main className="container section"><h1>Сценарий пройден</h1><p>Это демонстрация. Запись не создавалась, данные не отправлены.</p><Link href="/">Вернуться в каталог</Link></main>:Home()`
 shell=`<header className="site-header"><div className="container site-header__inner"><Link className="brand" href="/">ServiceHub</Link><nav className="site-nav"><Link href="/search">Каталог</Link></nav></div></header>{content}<footer className="site-footer"><div className="container">ServiceHub · Демонстрационная версия</div></footer>`
}
const localFetch=`window.fetch=async(input,init)=>{const url=String(input);let result={};if(url.includes('/api/slots'))result={slots:['10:00','12:00','14:00','16:00']};else if(url.includes('/api/bookings'))result={result:{bookingDatabaseId:'demo'}};else if(url.includes('/api/account/favorite')){if(init?.method==='POST')fav=!fav;result={authed:true,companyIds:fav?[1,2,3,4,5,6]:[],isFavorite:fav}}else throw new Error('Сеть отключена в демонстрации');return new Response(JSON.stringify(result),{status:200,headers:{'Content-Type':'application/json'}})};`
const entry=`import React,{useEffect,useState}from 'react';import{createRoot}from'react-dom/client';import Link,{useRoute}from './navigation';import './app/globals.css';import './demo.css';${imports}
let fav=false;${localFetch}
document.addEventListener('submit',e=>{const form=e.target;if(form.getAttribute('action')==='/search'){e.preventDefault();location.hash='/search?'+new URLSearchParams(new FormData(form)).toString();}},true);
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&/^(tel:|mailto:)/.test(a.getAttribute('href')||''))e.preventDefault();},true);
function Demo(){const route=useRoute();const[content,setContent]=useState(null);useEffect(()=>{let current=true;const pathname=route.split('?')[0].split('#')[0],params=Object.fromEntries(new URLSearchParams(route.split('?')[1]||''));Promise.resolve(${render}).then(c=>{if(current)setContent(c)}).catch(()=>{if(current)setContent(<main style={{padding:40}}><h1>Этот раздел не включён в демо</h1><Link href="/">К главной</Link></main>)});return()=>{current=false}},[route]);return <>${shell}</>};createRoot(document.getElementById('root')).render(<Demo/>);`
await writeFile(path.join(temp,'main.tsx'),entry)
await writeFile(path.join(temp,'demo.css'),`:root{--font-noto-serif:Georgia,serif;--font-inter:Arial,sans-serif;--font-geist-sans:Arial,sans-serif;--font-geist-mono:monospace}body{margin:0;overflow-x:hidden}img{max-width:100%}@media(max-width:650px){h1{font-size:42px!important}div[style*="grid-template-columns"]{grid-template-columns:1fr!important}div[style*="padding: 40px"]{padding:20px!important}div[style*="flex: 0 0 28px"]{flex-basis:8px!important}}`)
await writeFile(path.join(temp,'index.html'),`<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com; connect-src 'none'; form-action 'none'; frame-src 'none'"><title>${kind} — демоверсия проекта</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>`)
const out=path.resolve('public/demos/'+kind)
await build({configFile:false,root:temp,base:'./',plugins:[react(),tailwind()],resolve:{alias:{'@':temp,'next/link':path.join(temp,'navigation.tsx'),'next/navigation':path.join(temp,'navigation.tsx'),'next/image':path.join(temp,'image.tsx')}},build:{outDir:out,emptyOutDir:true,sourcemap:false,reportCompressedSize:false}})
await writeFile(path.join(out,'demo-manifest.json'),JSON.stringify({mode:'original-components-demo-data',project:kind,network:false,realSubmissions:false,sourceMaps:false},null,2))
console.log('Exported original site UI: '+kind)
