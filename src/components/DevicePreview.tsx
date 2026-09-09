import {useEffect,useRef,useState,type ReactNode} from 'react'

/** Device chrome is functional UI; screen dimensions stay stable while the shell scales. */
export function DevicePreview({mobile,children}:{mobile:boolean;children:ReactNode}){
  const screen=useRef<HTMLDivElement>(null)
  const [scale,setScale]=useState(1)
  const width=mobile?393:1280, height=mobile?760:800
  useEffect(()=>{
    const element=screen.current!
    const observer=new ResizeObserver(entries=>setScale(entries[0].contentRect.width/width))
    observer.observe(element)
    return()=>observer.disconnect()
  },[width])
  return <div className={`device-studio ${mobile?'is-phone':'is-laptop'}`}>
    <div className="device-shell">
      <div className="device-lid">
        <div className="device-status" aria-hidden="true">{mobile?<><span>9:41</span><i className="dynamic-island"/><span className="phone-signal">▂▄▆ ▰</span></>:<i className="laptop-camera"/>}</div>
        <div className="device-screen" ref={screen} style={{height:height*scale}}><div className="device-viewport" style={{width,height,transform:`scale(${scale})`}}>{children}</div></div>
        <div className="device-chin" aria-hidden="true">{mobile?<i/>:<span>MacBook Pro</span>}</div>
      </div>
      <div className="device-base" aria-hidden="true"><i/></div>
    </div>
    <p className="device-caption">{mobile?'iPhone 17':'MacBook Pro'} <span>·</span> {mobile?'393':'1280'} px <span>·</span> интерактивный предпросмотр</p>
  </div>
}
