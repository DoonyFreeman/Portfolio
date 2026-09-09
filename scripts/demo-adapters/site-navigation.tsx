import React, {useSyncExternalStore} from 'react'
const subscribe=(callback:()=>void)=>{window.addEventListener('hashchange',callback);return()=>window.removeEventListener('hashchange',callback)}
export const useRoute=()=>useSyncExternalStore(subscribe,()=>location.hash.slice(1)||'/')
export const usePathname=()=>useRoute().split('?')[0].split('#')[0]
export const useSearchParams=()=>new URLSearchParams(useRoute().split('?')[1]||'')
export const useRouter=()=>({push:(url:string)=>{location.hash=url},replace:(url:string)=>{location.replace('#'+url)},refresh:()=>{window.dispatchEvent(new Event('hashchange'))}})
export const notFound=()=>{throw new Error('Эта страница не входит в демонстрацию')}
export default function Link({href,children,prefetch,replace,...props}:any){return <a {...props} href={href.startsWith('/')?'#'+href:href} onClick={e=>{props.onClick?.(e);if(href.startsWith('/#')){e.preventDefault();location.hash='/';setTimeout(()=>document.getElementById(href.slice(2))?.scrollIntoView({behavior:'smooth'}),100)}}}>{children}</a>}
export function Image({src,alt,fill,priority,quality,sizes,...props}:any){return <img {...props} alt={alt||''} src={src} style={{...props.style,...(fill?{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}:{})}}/>}
