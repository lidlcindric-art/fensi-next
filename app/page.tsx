'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const HERO_PHOTOS = [
  '/photos/red-waves.jpg',
  '/photos/blonde-waves.jpg',
  '/photos/dark-waves-long.jpg',
  '/photos/straight-blonde.jpg',
  '/photos/chocolate-waves.jpg',
]

const SERVICES = [
  {
    title: 'Oblikuj',
    label: 'Šišanje & Styling',
    img: '/photos/bob-highlights.jpg',
    desc: 'Od smjelih modernih šišanja do bezvremenih klasika — svaki rez je statement. Nije to samo šišanje, to je izjava o tebi.',
  },
  {
    title: 'Unaprijedi',
    label: 'Keratin & Ravnanje',
    img: '/photos/straight-brown.jpg',
    desc: 'Keratin tretmani, brazilsko ravnanje, regeneracija — transformiramo kosu iznutra prema van. Svilenkasta glatkoća koja traje tjednima.',
  },
  {
    title: 'Osvjetli',
    label: 'Boja & Pramenovi',
    img: '/photos/red-waves.jpg',
    desc: 'Bila to smjela vibrantna boja ili nježni prirodni pramenovi — naše usluge bojanja oživljavaju tvoju viziju. Neka kosa zasja.',
  },
  {
    title: 'Uzdigni',
    label: 'Svečane frizure',
    img: '/photos/dark-waves-long.jpg',
    desc: 'Za vjenčanja, mature i posebne prigode — svečana frizura koja ostaje u sjećanju. Elegantno, moderno, savršeno za tvoj dan.',
  },
]

const GALLERY = [
  { src: '/photos/red-waves.jpg',       name: 'Vibrantna Crvena',   desc: 'Boja kose' },
  { src: '/photos/bob-highlights.jpg',  name: 'Bob s Pramenovima',  desc: 'Šišanje' },
  { src: '/photos/blonde-waves.jpg',    name: 'Plavi Valovi',       desc: 'Boja & valovi' },
  { src: '/photos/dark-waves-long.jpg', name: 'Dugačka Tamna',      desc: 'Valovi' },
  { src: '/photos/dark-black-waves.jpg',name: 'Crna & Valovita',    desc: 'Styling' },
  { src: '/photos/straight-blonde.jpg', name: 'Ravna Plava',        desc: 'Keratin' },
  { src: '/photos/straight-brown.jpg',  name: 'Smeđi Keratin',      desc: 'Tretman' },
  { src: '/photos/chocolate-waves.jpg', name: 'Čokoladni Valovi',   desc: 'Boja & valovi' },
]

const TESTIMONIALS = [
  { q: 'Došla sam nesigurna što želim, a otišla kao best version of sebe. Đurđicina pažnja i kreativnost su neusporedivi — nikad nisam više voljela svoju kosu!', name: 'Marija K.' },
  { q: 'Keratin tretman potpuno je promijenio moju kosu. Boja je vibrantna, highlights besprijekorni — i dalje dobivam komplimente! Ima pravi talent za ono što odgovara upravo tebi.', name: 'Ivana M.' },
  { q: 'Došla sam po svečanu frizuru za vjenčanje i Đurđica je stvorila nešto što me natjeralo da se osjećam kao kraljica. Stil je bio elegantan, savršen cijeli dan.', name: 'Ana T.' },
]

const RADNO: Record<number, { disp: string; od: string; do: string } | null> = {
  1: { disp: '9:00 – 16:00', od: '09:00', do: '15:30' },
  2: { disp: '12:00 – 19:00', od: '12:00', do: '18:30' },
  3: { disp: '9:00 – 16:00', od: '09:00', do: '15:30' },
  4: { disp: '12:00 – 19:00', od: '12:00', do: '18:30' },
  5: { disp: '9:00 – 16:00', od: '09:00', do: '15:30' },
  6: null, 0: null,
}
const DAYS = ['Nedjelja','Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota']
const MONTHS = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac']

function getSlots(dow: number) {
  const r = RADNO[dow]; if (!r) return []
  const out: string[] = []; let h=+r.od.split(':')[0],m=+r.od.split(':')[1]
  const [eh,em]=r.do.split(':').map(Number)
  while(h<eh||(h===eh&&m<=em)){out.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);m+=30;if(m>=60){m-=60;h++}}
  return out
}

/* ─── MAIN ─────────────────────────────────────────────────── */
export default function FensiPage() {
  /* refs */
  const loaderRef    = useRef<HTMLDivElement>(null)
  const loaderWordRef= useRef<HTMLSpanElement>(null)
  const loaderSubRef = useRef<HTMLDivElement>(null)
  const loaderBarRef = useRef<HTMLDivElement>(null)
  const dotRef       = useRef<HTMLDivElement>(null)
  const ringRef      = useRef<HTMLDivElement>(null)
  const heroW1Ref    = useRef<HTMLSpanElement>(null)
  const heroW2Ref    = useRef<HTMLSpanElement>(null)
  const heroW3Ref    = useRef<HTMLSpanElement>(null)
  const heroTagRef   = useRef<HTMLDivElement>(null)
  const heroSubRef   = useRef<HTMLDivElement>(null)
  const heroCtaRef   = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const galRef       = useRef<HTMLDivElement>(null)
  const progressRef  = useRef<HTMLDivElement>(null)

  /* state */
  const [heroIdx, setHeroIdx] = useState(0)
  const [srvIdx,  setSrvIdx]  = useState(0)
  const [srvPrev, setSrvPrev] = useState<number|null>(null)
  const [srvDir,  setSrvDir]  = useState(1)
  const [testiIdx,setTestiIdx]= useState(0)
  const [navSolid,setNavSolid]= useState(false)
  const [drawer,  setDrawer]  = useState(false)

  /* booking */
  const [calY,setCalY] = useState(new Date().getFullYear())
  const [calM,setCalM] = useState(new Date().getMonth())
  const [selDate,setSelDate]   = useState<string|null>(null)
  const [selTime,setSelTime]   = useState<string|null>(null)
  const [daySlots,setDaySlots] = useState<{time:string;taken:boolean}[]>([])
  const [slotsLoad,setSlotsLoad]=useState(false)
  const [takenMap,setTakenMap] = useState<Record<string,string[]>>({})
  const [form,setForm]= useState({name:'',phone:'',email:'',service:'',note:''})
  const [submitting,setSubmitting]=useState(false)
  const [done,setDone]=useState(false)
  const [doneMsg,setDoneMsg]=useState('')

  /* admin */
  const [adminOpen,setAdminOpen]=useState(false)
  const [adminPass,setAdminPass]=useState('')
  const [adminKey, setAdminKey] =useState('')
  const [adminAppts,setAdminAppts]=useState<any[]>([])
  const [adminTab, setAdminTab] =useState('today')
  const [adminErr, setAdminErr] =useState(false)

  /* ── PARTICLE WAVE CANVAS ─────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d'); if(!ctx) return
    let W=0, H=0, raf=0
    const particles: {x:number;y:number;r:number;vx:number;vy:number;a:number}[] = []
    const resize = () => { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; }
    resize(); window.addEventListener('resize', resize)
    for(let i=0;i<80;i++) particles.push({x:Math.random()*1400,y:Math.random()*900,r:Math.random()*1.5+.3,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.2,a:Math.random()})
    const draw = () => {
      ctx.clearRect(0,0,W,H)
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.a+=.005
        if(p.x<0)p.x=W; if(p.x>W)p.x=0
        if(p.y<0)p.y=H; if(p.y>H)p.y=0
        ctx.beginPath()
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(239,215,202,${.08+Math.sin(p.a)*.06})`
        ctx.fill()
      })
      // connecting lines
      for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++) {
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y
        const dist=Math.sqrt(dx*dx+dy*dy)
        if(dist<120){ ctx.beginPath(); ctx.strokeStyle=`rgba(239,215,202,${.04*(1-dist/120)})`; ctx.lineWidth=.5; ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke() }
      }
      raf=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  }, [])

  /* ── GSAP + LENIS INIT ───────────────────────── */
  useEffect(() => {
    let lenis: any
    const init = async () => {
      const { gsap }        = await import('gsap')
      const { ScrollTrigger}= await import('gsap/ScrollTrigger')
      const LenisModule     = await import('@studio-freight/lenis')
      const Lenis = LenisModule.default
      gsap.registerPlugin(ScrollTrigger)

      /* LOADER */
      const tl = gsap.timeline({ onComplete: () => {
        gsap.to(loaderRef.current, { yPercent:-100, duration:.9, ease:'power3.inOut',
          onComplete:()=>{ if(loaderRef.current) loaderRef.current.style.display='none' } })
        startAnimations(gsap, ScrollTrigger)
      }})
      tl.to(loaderBarRef.current,  { width:'100%', duration:1.4, ease:'power2.inOut' })
        .to(loaderWordRef.current,  { y:0, duration:.8, ease:'power3.out' }, '-=.8')
        .to(loaderSubRef.current,   { opacity:1, y:0, duration:.5, ease:'power2.out' }, '-=.4')
        .to({}, { duration:.5 })

      /* LENIS */
      lenis = new Lenis({ lerp:.075, wheelMultiplier:.9 })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add((t:number) => lenis.raf(t*1000))
      gsap.ticker.lagSmoothing(0)
      lenis.on('scroll', ({ progress }:{progress:number}) => {
        if(progressRef.current) progressRef.current.style.width=(progress*100)+'%'
        setNavSolid(window.scrollY>80)
      })
    }

    const startAnimations = (gsap:any, ST:any) => {
      /* hero words — clip reveal */
      gsap.timeline({ delay:.05 })
        .fromTo(heroTagRef.current, {opacity:0,y:18},{opacity:1,y:0,duration:.6,ease:'power2.out'})
        .fromTo([heroW1Ref.current,heroW2Ref.current,heroW3Ref.current],
          {yPercent:105},{yPercent:0,duration:1,ease:'power3.out',stagger:.13},'-=.35')
        .fromTo(heroSubRef.current, {opacity:0,y:16},{opacity:1,y:0,duration:.6,ease:'power2.out'},'-=.5')
        .fromTo(heroCtaRef.current, {opacity:0,y:16},{opacity:1,y:0,duration:.6,ease:'power2.out'},'-=.45')

      /* scroll reveals */
      document.querySelectorAll('[data-r]').forEach(el => {
        const dir = el.getAttribute('data-r')
        const d = +(el.getAttribute('data-d')||0)
        gsap.fromTo(el,
          { opacity:0, y:dir==='up'?56:0, x:dir==='left'?-48:dir==='right'?48:0, scale:dir==='scale'?.9:1 },
          { opacity:1, y:0, x:0, scale:1, duration:1, ease:'power3.out', delay:d*.12,
            scrollTrigger:{ trigger:el, start:'top 88%' } })
      })

      /* clip reveals */
      document.querySelectorAll('[data-clip]').forEach(el => {
        gsap.fromTo(el,
          { clipPath:'inset(0 100% 0 0)' },
          { clipPath:'inset(0 0% 0 0)', duration:1.2, ease:'power3.inOut',
            scrollTrigger:{ trigger:el, start:'top 85%' } })
      })

      /* parallax images */
      document.querySelectorAll('[data-par]').forEach(el => {
        const s = +(el.getAttribute('data-par')||.3)
        gsap.to(el, { yPercent:-12*s, ease:'none',
          scrollTrigger:{ trigger:(el as HTMLElement).closest('section'), start:'top bottom', end:'bottom top', scrub:1.5 } })
      })

      /* GALLERY drag */
      const gal = galRef.current
      if(gal){
        let dn=false,sx=0,sl=0,vel=0,lx=0,raf=0
        gal.addEventListener('mousedown',e=>{dn=true;gal.style.cursor='grabbing';sx=e.pageX;sl=gal.scrollLeft;vel=0;cancelAnimationFrame(raf)})
        document.addEventListener('mouseup',()=>{ if(!dn)return;dn=false;gal.style.cursor='grab'
          const mo=()=>{gal.scrollLeft+=vel;vel*=.92;if(Math.abs(vel)>.5)raf=requestAnimationFrame(mo)};mo()})
        gal.addEventListener('mousemove',e=>{ if(!dn)return;e.preventDefault();gal.scrollLeft=sl-(e.pageX-sx);vel=lx-e.pageX;lx=e.pageX})
      }

      /* services drag */
      const srv = document.querySelector('.srv-drag') as HTMLElement
      if(srv){
        let dn=false,sx=0,sl=0
        srv.addEventListener('mousedown',e=>{dn=true;srv.style.cursor='grabbing';sx=e.pageX;sl=srv.scrollLeft})
        document.addEventListener('mouseup',()=>{dn=false;srv.style.cursor='grab'})
        srv.addEventListener('mousemove',e=>{if(!dn)return;e.preventDefault();srv.scrollLeft=sl-(e.pageX-sx)*1.5})
      }

      /* magnetic buttons */
      document.querySelectorAll('.mag').forEach(el => {
        const b=el as HTMLElement
        b.addEventListener('mousemove',e=>{ const r=b.getBoundingClientRect(); const x=e.clientX-r.left-r.width/2; const y=e.clientY-r.top-r.height/2; gsap.to(b,{x:x*.22,y:y*.22,duration:.4,ease:'power2.out'}) })
        b.addEventListener('mouseleave',()=>gsap.to(b,{x:0,y:0,duration:.55,ease:'elastic.out(1,.5)'}))
      })
    }

    init()
    return () => { lenis?.destroy() }
  }, [])

  /* ── CURSOR ──────────────────────────────────── */
  useEffect(() => {
    let cx=0,cy=0,rx=0,ry=0,raf=0
    const move=(e:MouseEvent)=>{cx=e.clientX;cy=e.clientY}
    const render=()=>{
      if(dotRef.current){dotRef.current.style.left=cx+'px';dotRef.current.style.top=cy+'px'}
      rx+=(cx-rx)*.11;ry+=(cy-ry)*.11
      if(ringRef.current){ringRef.current.style.left=rx+'px';ringRef.current.style.top=ry+'px'}
      raf=requestAnimationFrame(render)
    }
    const on=()=>document.body.classList.add('ch')
    const off=()=>document.body.classList.remove('ch')
    document.addEventListener('mousemove',move)
    document.querySelectorAll('a,button,.mag,.gal-item').forEach(el=>{el.addEventListener('mouseenter',on);el.addEventListener('mouseleave',off)})
    render()
    return ()=>{document.removeEventListener('mousemove',move);cancelAnimationFrame(raf)}
  },[])

  /* ── HERO SLIDESHOW ──────────────────────────── */
  useEffect(() => {
    const t=setInterval(()=>setHeroIdx(i=>(i+1)%HERO_PHOTOS.length),4500)
    return ()=>clearInterval(t)
  },[])

  /* ── TESTI AUTO-ROTATE ───────────────────────── */
  useEffect(()=>{ const t=setInterval(()=>setTestiIdx(i=>(i+1)%TESTIMONIALS.length),6000);return()=>clearInterval(t)},[])

  /* ── SERVICE NAV ─────────────────────────────── */
  const goSrv=(n:number)=>{
    const next=(n+SERVICES.length)%SERVICES.length
    setSrvDir(n>srvIdx?1:-1)
    setSrvPrev(srvIdx)
    setSrvIdx(next)
    setTimeout(()=>setSrvPrev(null),900)
  }

  /* ── CALENDAR ────────────────────────────────── */
  const fetchSlots=useCallback(async(ds:string)=>{
    if(takenMap[ds]) return takenMap[ds]
    try{ const r=await fetch(`/api/appointments?view=slots&date=${ds}`);const d=await r.json();const s=d.slots||[];setTakenMap(p=>({...p,[ds]:s}));return s }
    catch{ return[] }
  },[takenMap])

  const selectDate=async(ds:string)=>{
    setSelDate(ds);setSelTime(null);setSlotsLoad(true)
    const [y,m,d]=ds.split('-').map(Number)
    const dw=new Date(y,m-1,d).getDay()
    if(!RADNO[dw]){setDaySlots([]);setSlotsLoad(false);return}
    const taken=await fetchSlots(ds)
    const now=new Date()
    const todStr=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    const isToday=ds===todStr
    const nowM=now.getHours()*60+now.getMinutes()+30
    const all=getSlots(dw)
    const avail=isToday?all.filter(s=>{const[h,mn]=s.split(':').map(Number);return h*60+mn>nowM}):all
    setDaySlots(avail.map(t=>({time:t,taken:taken.includes(t)})))
    setSlotsLoad(false)
  }

  const calDays=()=>{
    const first=new Date(calY,calM,1); const startDow=(first.getDay()+6)%7
    const total=new Date(calY,calM+1,0).getDate(); const today=new Date()
    const out:any[]=[]
    for(let i=0;i<startDow;i++) out.push({empty:true})
    for(let d=1;d<=total;d++){
      const dt=new Date(calY,calM,d)
      const past=dt<new Date(today.getFullYear(),today.getMonth(),today.getDate())
      const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      out.push({d,ds,past,isT:dt.toDateString()===today.toDateString(),closed:!RADNO[dt.getDay()],sel:ds===selDate})
    }
    return out
  }

  /* ── SUBMIT ──────────────────────────────────── */
  const submit=async()=>{
    if(!form.name||!form.phone||!form.service)return alert('Ispunite ime, telefon i uslugu.')
    if(!selDate||!selTime)return alert('Odaberite datum i termin.')
    setSubmitting(true)
    try{
      const r=await fetch('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,date:selDate,time:selTime})})
      const data=await r.json();if(!r.ok)throw new Error(data.error)
      setTakenMap(p=>({...p,[selDate]:[...(p[selDate]||[]),selTime]}))
      const[y,m,d]=selDate.split('-').map(Number)
      const lbl=new Date(y,m-1,d).toLocaleDateString('hr-HR',{weekday:'long',day:'numeric',month:'long'})
      setDoneMsg(`${form.name}, vidimo se ${lbl} u ${selTime}.`);setDone(true)
    }catch(e:any){alert(e.message)}
    setSubmitting(false)
  }

  /* ── ADMIN ───────────────────────────────────── */
  const adminAuth=async()=>{
    setAdminErr(false)
    try{const r=await fetch('/api/appointments',{headers:{'x-admin-key':adminPass}});if(!r.ok)throw new Error();const d=await r.json();setAdminAppts(d.appointments||[]);setAdminKey(adminPass)}
    catch{setAdminErr(true)}
  }
  const confirmA=async(id:string)=>{ await fetch(`/api/appointments?id=${id}`,{method:'PATCH',headers:{'x-admin-key':adminKey}});setAdminAppts(p=>p.map(a=>a.id===id?{...a,status:'confirmed'}:a)) }
  const deleteA=async(id:string,date:string,time:string)=>{ if(!confirm(`Otkazati ${date} u ${time}?`))return;await fetch(`/api/appointments?id=${id}`,{method:'DELETE',headers:{'x-admin-key':adminKey}});setAdminAppts(p=>p.filter(a=>a.id!==id)) }

  const todayStr=new Date().toISOString().split('T')[0]
  const filtAppts=adminTab==='pending'?adminAppts.filter(a=>a.status==='pending'):adminTab==='today'?adminAppts.filter(a=>a.date===todayStr):adminTab==='upcoming'?adminAppts.filter(a=>a.date>=todayStr).slice(0,30):adminAppts
  const pendCnt=adminAppts.filter(a=>a.status==='pending').length

  const scrollTo=(id:string)=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth'});setDrawer(false) }

  /* ── RENDER ──────────────────────────────────── */
  return (
    <>
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={progressRef} id="sp" />

      {/* ═══ LOADER ══════════════════════════════ */}
      <div ref={loaderRef} className="loader">
        <div className="loader-word">
          <span ref={loaderWordRef} className="loader-word-inner">Fensi</span>
        </div>
        <div ref={loaderSubRef} className="loader-sub" style={{transform:'translateY(8px)'}}>frizerski salon · zagreb</div>
        <div ref={loaderBarRef} className="loader-bar" />
      </div>

      {/* ═══ NAV ═════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 md:px-12 transition-all duration-500"
        style={{padding:'1.6rem 3rem',
          ...(navSolid?{background:'rgba(21,2,24,.94)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(239,215,202,.08)',paddingTop:'1rem',paddingBottom:'1rem'}:{}) }}>
        <a href="#" className="flex flex-col" style={{fontFamily:"'Josefin Sans',sans-serif"}}>
          <span style={{fontSize:'1.1rem',fontWeight:700,letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream)'}}>Fensi</span>
          <span style={{fontSize:'.45rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',marginTop:'1px'}}>frizerski salon</span>
        </a>
        <ul className="hidden md:flex gap-8 list-none">
          {[['o salonu','osalonu'],['usluge','usluge'],['galerija','galerija'],['radno','radno'],['kontakt','kontakt']].map(([l,id])=>(
            <li key={id}><button onClick={()=>scrollTo(id)} className="nav-link bg-transparent border-0">{l}</button></li>
          ))}
        </ul>
        <button onClick={()=>scrollTo('rezervacija')} className="mag btn-book hidden md:flex">
          <span>rezerviraj</span><span style={{fontSize:'.9rem'}}>→</span>
        </button>
        <button className="md:hidden bg-transparent border-0 p-1 flex flex-col gap-[5px]" onClick={()=>setDrawer(o=>!o)}>
          {[0,1,2].map(i=><span key={i} style={{display:'block',width:'22px',height:'1px',background:'var(--cream50)'}}/>)}
        </button>
      </nav>

      {/* Mobile drawer */}
      {drawer&&<div className="fixed inset-0 z-[199]" style={{background:'rgba(21,2,24,.9)',backdropFilter:'blur(10px)'}} onClick={()=>setDrawer(false)}>
        <div className="absolute right-0 top-0 h-full w-72 flex flex-col pt-20 px-8 gap-1" style={{background:'var(--bg2)'}} onClick={e=>e.stopPropagation()}>
          {[['o salonu','osalonu'],['usluge','usluge'],['galerija','galerija'],['radno','radno'],['rezervacija','rezervacija'],['kontakt','kontakt']].map(([l,id])=>(
            <button key={id} onClick={()=>scrollTo(id)} className="text-left py-3 border-b bg-transparent border-0 nav-link" style={{borderColor:'var(--cream10)'}}>{l}</button>
          ))}
          <button onClick={()=>scrollTo('rezervacija')} className="btn-wow mag mt-6 justify-center"><span>rezerviraj sada</span><span className="btn-shimmer"/><span>→</span></button>
        </div>
      </div>}

      {/* ═══ HERO ════════════════════════════════ */}
      <section id="hero" className="relative overflow-hidden" style={{height:'100dvh',minHeight:'640px',background:'var(--bg)'}}>
        {/* particle canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{zIndex:1,pointerEvents:'none'}}/>

        {/* background photo slideshow */}
        {HERO_PHOTOS.map((src,i)=>(
          <div key={src} className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out" style={{zIndex:0,opacity:i===heroIdx?1:0}}>
            <Image src={src} alt="Fensi salon" fill style={{objectFit:'cover',objectPosition:'center 20%',filter:'brightness(.45)',transform:i===heroIdx?'scale(1)':'scale(1.06)',transition:'transform 6s ease'}} priority={i===0} sizes="100vw"/>
          </div>
        ))}

        {/* left gradient */}
        <div className="absolute inset-0" style={{zIndex:2,background:'linear-gradient(to right, rgba(21,2,24,.9) 0%, rgba(21,2,24,.5) 55%, rgba(21,2,24,.1) 100%), linear-gradient(to top, rgba(21,2,24,.7) 0%, transparent 50%)'}}/>

        {/* "the mirror" vertical label */}
        <div className="absolute hidden md:block" style={{left:'2.8rem',top:'50%',transform:'translateY(-50%) rotate(-90deg)',zIndex:3,fontSize:'.55rem',letterSpacing:'5px',textTransform:'uppercase',color:'var(--cream20)',fontFamily:"'Josefin Sans'"}}>
          il salotto · zagreb
        </div>

        {/* slide counter right */}
        <div className="absolute hidden md:flex flex-col items-center gap-3" style={{right:'2.8rem',top:'50%',transform:'translateY(-50%)',zIndex:3}}>
          <div style={{width:'1px',height:'48px',background:'var(--cream10)'}}/>
          <span style={{fontSize:'.7rem',color:'var(--cream20)',writingMode:'vertical-rl',letterSpacing:'2px',fontFamily:"'Josefin Sans'"}}>
            {String(heroIdx+1).padStart(2,'0')} / {String(HERO_PHOTOS.length).padStart(2,'0')}
          </span>
          <div style={{width:'1px',height:'48px',background:'var(--cream10)'}}/>
        </div>

        {/* slide dots */}
        <div className="absolute flex gap-[6px]" style={{bottom:'2.5rem',right:'2.8rem',zIndex:3}}>
          {HERO_PHOTOS.map((_,i)=>(
            <button key={i} onClick={()=>setHeroIdx(i)} style={{width:i===heroIdx?'22px':'5px',height:'5px',borderRadius:i===heroIdx?'3px':'50%',background:i===heroIdx?'var(--cream)':'var(--cream20)',border:'none',transition:'all .3s',cursor:'pointer',padding:0}}/>
          ))}
        </div>

        {/* scroll down */}
        <div className="absolute flex flex-col items-center gap-2" style={{bottom:'2.2rem',left:'50%',transform:'translateX(-50%)',zIndex:3,opacity:0,animation:'haFallback 0s 3s forwards'}}>
          <div style={{width:'1px',height:'44px',background:'var(--cream20)',animation:'scPulse 2s ease-in-out infinite'}}/>
          <span style={{fontSize:'.52rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream20)',fontFamily:"'Josefin Sans'"}}>scroll down</span>
        </div>

        {/* hero content — left aligned like template */}
        <div className="absolute flex flex-col justify-end pb-24 px-8 md:px-16" style={{inset:0,zIndex:3,maxWidth:'820px'}}>
          {/* eyebrow */}
          <div ref={heroTagRef} className="hero-anim flex items-center gap-3 mb-6">
            <div style={{width:'28px',height:'1px',background:'var(--cream50)'}}/>
            <span style={{fontSize:'.6rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',fontFamily:"'Josefin Sans'"}}>frizerski salon · zagreb</span>
          </div>

          {/* BIG HEADLINE — left aligned, Josefin Sans like template */}
          <h1 style={{fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,lineHeight:.88,letterSpacing:'-1px'}}>
            <span className="hero-word"><span ref={heroW1Ref} className="hero-word-inner" style={{display:'block',fontSize:'clamp(3.5rem,11vw,8rem)',textTransform:'uppercase',color:'var(--cream)'}}>Ljepota</span></span>
            <span className="hero-word"><span ref={heroW2Ref} className="hero-word-inner" style={{display:'block',fontSize:'clamp(3.5rem,11vw,8rem)',textTransform:'uppercase',color:'var(--cream)'}}>Izvan</span></span>
            <span className="hero-word"><span ref={heroW3Ref} className="hero-word-inner" style={{display:'block',fontSize:'clamp(3.5rem,11vw,8rem)',textTransform:'uppercase',color:'var(--cream50)'}}>Granica.</span></span>
          </h1>

          {/* subtitle */}
          <div ref={heroSubRef} className="hero-anim mt-6" style={{maxWidth:'360px'}}>
            <p style={{fontSize:'.95rem',color:'var(--cream)',lineHeight:'1.85',fontWeight:400,letterSpacing:'.3px'}}>Zajedno stvaramo nešto izvanredno!</p>
            <p style={{fontSize:'.95rem',color:'var(--cream60)',lineHeight:'1.85',fontWeight:300}}>Frizura koja je jedinstvena kao ti.</p>
          </div>

          {/* CTA */}
          <div ref={heroCtaRef} className="hero-anim flex items-center gap-6 mt-8">
            <button className="mag btn-wow" onClick={()=>scrollTo('rezervacija')}>
              <span>rezerviraj</span>
              <span className="btn-shimmer"/>
              <span style={{fontSize:'.85rem'}}>→</span>
            </button>
            <button onClick={()=>scrollTo('galerija')} className="nav-link bg-transparent border-0" style={{color:'var(--cream50)'}}>
              vidi radove
            </button>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT ═══════════════════════════════ */}
      <section id="osalonu" className="grid grid-cols-1 md:grid-cols-2" style={{background:'var(--bg)',minHeight:'600px'}}>
        {/* photos */}
        <div className="relative overflow-hidden" style={{minHeight:'500px'}}>
          <div className="absolute inset-0 grid grid-cols-2 gap-[3px]">
            <div className="relative overflow-hidden" data-clip>
              <Image src="/photos/bob-highlights.jpg" alt="Salon" fill style={{objectFit:'cover',objectPosition:'center 15%'}} data-par=".8" sizes="25vw"/>
            </div>
            <div className="relative overflow-hidden mt-12" data-clip style={{marginTop:'3rem'}}>
              <Image src="/photos/dark-black-waves.jpg" alt="Rad" fill style={{objectFit:'cover',objectPosition:'center 20%'}} data-par="1.2" sizes="25vw"/>
            </div>
          </div>
        </div>

        {/* text */}
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-20" style={{borderLeft:'1px solid var(--cream10)'}}>
          <p data-r="up" style={{fontSize:'.62rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'1rem',fontFamily:"'Josefin Sans'"}}>Više od salona</p>
          <h2 data-r="up" data-d="1" style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:700,lineHeight:.92,textTransform:'uppercase',letterSpacing:'-1px',color:'var(--cream)',marginBottom:'1.5rem'}}>
            Utočište<br />za stil
          </h2>
          <div data-r="up" data-d="2" style={{width:'40px',height:'1px',background:'var(--cream50)',marginBottom:'1.5rem'}}/>
          <p data-r="up" data-d="2" style={{fontSize:'.95rem',color:'var(--cream60)',lineHeight:'1.9',marginBottom:'1rem',fontWeight:300}}>
            U Fensi salonu vjerujemo u moć kose da transformira, osnažuje i nadahnjuje. Od prvog trenutka dobit ćeš artizam, brigu i posvećenost koja tvoju viziju pretvara u stvarnost.
          </p>
          <p data-r="up" data-d="3" style={{fontSize:'.95rem',color:'var(--cream50)',lineHeight:'1.9',fontWeight:300,fontStyle:'italic'}}>
            Ovdje svaki detalj ima značenje — jer tvoja kosa priča tvoju priču.
          </p>
          <div className="flex flex-col mt-8 gap-0" data-r="up" data-d="4">
            {['Boja, pramenovi & balayage','Keratin tretmani & ravnanje','Valovi & trajna ondulacija','Svečane i svatovske frizure'].map(f=>(
              <div key={f} className="flex items-center gap-3 py-3" style={{borderBottom:'1px solid var(--cream10)',fontSize:'.82rem',color:'var(--cream)',letterSpacing:'1px'}}>
                <span style={{color:'var(--cream50)'}}>—</span> {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES — full-screen slider like template ═════ */}
      <section id="usluge" className="relative overflow-hidden" style={{height:'100vh',minHeight:'600px',background:'var(--bg)'}}>
        {/* slides */}
        {SERVICES.map((s,i)=>(
          <div key={s.title} className={`srv-slide${i===srvIdx?' active':''}`}>
            <Image src={s.img} alt={s.title} fill style={{objectFit:'cover',objectPosition:'center 20%',filter:'brightness(.38)'}} sizes="100vw"/>
            {/* left dark gradient */}
            <div className="absolute inset-0" style={{background:'linear-gradient(to right, rgba(21,2,24,.88) 0%, rgba(21,2,24,.45) 60%, rgba(21,2,24,.05) 100%)'}}/>

            {/* text content */}
            <div className="absolute flex flex-col justify-center px-8 md:px-20" style={{inset:0,maxWidth:'700px'}}>
              <p style={{fontSize:'.62rem',letterSpacing:'5px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'1.2rem',fontFamily:"'Josefin Sans'"}}>Usluge</p>
              <h2 style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'clamp(4rem,10vw,7.5rem)',fontWeight:700,lineHeight:.88,textTransform:'uppercase',letterSpacing:'-1px',color:'var(--cream)',marginBottom:'1rem'}}>
                {s.title}
              </h2>
              <p style={{fontSize:'1rem',color:'var(--cream60)',lineHeight:'1.85',maxWidth:'420px',fontWeight:300}}>{s.desc}</p>
              <button onClick={()=>scrollTo('rezervacija')} className="mag btn-book mt-8" style={{width:'fit-content'}}>
                <span>rezerviraj danas</span><span style={{fontSize:'.9rem'}}>→</span>
              </button>
            </div>
          </div>
        ))}

        {/* prev/next like template */}
        <div className="absolute flex items-center justify-between px-6 md:px-12" style={{bottom:'2.5rem',left:0,right:0,zIndex:10}}>
          <button onClick={()=>goSrv(srvIdx-1)} className="btn-book mag" style={{fontSize:'.62rem',padding:'.6rem 1.2rem'}}><span>prev</span></button>
          {/* service name dots */}
          <div className="flex gap-2">
            {SERVICES.map((_,i)=>(
              <button key={i} onClick={()=>goSrv(i)} style={{width:i===srvIdx?'32px':'6px',height:'6px',borderRadius:i===srvIdx?'3px':'50%',background:i===srvIdx?'var(--cream)':'var(--cream20)',border:'none',transition:'all .4s',cursor:'pointer',padding:0}}/>
            ))}
          </div>
          <button onClick={()=>goSrv(srvIdx+1)} className="btn-book mag" style={{fontSize:'.62rem',padding:'.6rem 1.2rem'}}><span>next</span></button>
        </div>

        {/* slide counter */}
        <div className="absolute" style={{top:'2.5rem',right:'3rem',zIndex:10,fontSize:'.65rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream50)'}}>
          {String(srvIdx+1).padStart(2,'0')} / {String(SERVICES.length).padStart(2,'0')}
        </div>

        {/* service label strip right */}
        <div className="absolute flex flex-col gap-6 items-end" style={{right:'2.5rem',top:'50%',transform:'translateY(-50%)',zIndex:10}}>
          {SERVICES.map((s,i)=>(
            <button key={s.title} onClick={()=>goSrv(i)} className="nav-link bg-transparent border-0" style={{writingMode:'vertical-rl',fontSize:'.55rem',letterSpacing:'3px',opacity:i===srvIdx?1:.25,transition:'opacity .3s'}}>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ GALLERY — horizontal scroll with "get this look" ═ */}
      <section id="galerija" style={{background:'var(--bg2)',paddingTop:'5rem',paddingBottom:'3rem'}}>
        <div className="px-8 md:px-16 mb-10">
          <p data-r="up" style={{fontSize:'.62rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'1rem'}}>Naši radovi</p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2 data-r="up" data-d="1" style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'clamp(2rem,6vw,4rem)',fontWeight:700,textTransform:'uppercase',letterSpacing:'-1px',color:'var(--cream)',lineHeight:.92}}>
              Inspiriraj se<br /><span style={{color:'var(--cream50)'}}>našim radovima.</span>
            </h2>
            <p data-r="up" data-d="2" style={{fontSize:'.9rem',color:'var(--cream50)',maxWidth:'300px',lineHeight:'1.8',fontWeight:300}}>
              Istraži portfolio transformacija. Svaki stil odražava artizam i individualnost.
            </p>
          </div>
        </div>

        {/* horizontal scroll gallery */}
        <div ref={galRef} className="flex gap-[3px] overflow-x-auto pb-2 select-none" style={{scrollbarWidth:'none' as any,cursor:'grab',WebkitOverflowScrolling:'touch'} as any}>
          {GALLERY.map((g,i)=>(
            <div key={g.src} className="gal-item flex-none relative overflow-hidden" style={{width:'clamp(220px,22vw,320px)',aspectRatio:'3/4',flexShrink:0}}>
              <Image src={g.src} alt={g.name} fill style={{objectFit:'cover',objectPosition:'center 15%',transition:'transform .6s ease'}} sizes="320px" className="gal-img"/>
              <div className="gal-item-overlay">
                <div className="gal-item-name">{g.name}</div>
                <div className="gal-item-price">{g.desc}</div>
                <div className="gal-item-cta">get this look</div>
              </div>
            </div>
          ))}
        </div>

        {/* gallery nav */}
        <div className="flex items-center gap-4 px-8 md:px-16 mt-6">
          <button className="btn-book mag" style={{padding:'.55rem 1.1rem',fontSize:'.6rem'}}
            onClick={()=>galRef.current&&(galRef.current.scrollLeft-=300)}><span>←</span></button>
          <button className="btn-book mag" style={{padding:'.55rem 1.1rem',fontSize:'.6rem'}}
            onClick={()=>galRef.current&&(galRef.current.scrollLeft+=300)}><span>→</span></button>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════ */}
      <section style={{background:'var(--bg)',padding:'6rem 2rem',position:'relative',overflow:'hidden'}}>
        {/* bg image faded */}
        <div className="absolute inset-0" style={{zIndex:0}}>
          <Image src="/photos/chocolate-waves.jpg" alt="" fill style={{objectFit:'cover',objectPosition:'center',filter:'brightness(.12)'}} sizes="100vw"/>
        </div>
        <div className="relative max-w-3xl mx-auto text-center" style={{zIndex:1}}>
          <p data-r="up" style={{fontSize:'.62rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'1.5rem'}}>Što kažu klientice</p>
          <h2 data-r="up" data-d="1" style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'clamp(2rem,5vw,3rem)',fontWeight:700,textTransform:'uppercase',letterSpacing:'-1px',color:'var(--cream)',marginBottom:'1rem',lineHeight:.95}}>
            Povjerenje<br /><span style={{color:'var(--cream50)'}}>počinje ovdje.</span>
          </h2>
          <div style={{width:'40px',height:'1px',background:'var(--cream20)',margin:'2rem auto'}}/>
          <p data-r="up" data-d="2" style={{fontSize:'clamp(1rem,2.5vw,1.2rem)',color:'var(--cream60)',lineHeight:'1.7',fontWeight:300,fontStyle:'italic',letterSpacing:'.2px',marginBottom:'1.5rem'}}>
            "{TESTIMONIALS[testiIdx].q}"
          </p>
          <p style={{fontSize:'.75rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream50)'}}>— {TESTIMONIALS[testiIdx].name}</p>
          {/* counter */}
          <p style={{fontSize:'.6rem',color:'var(--cream20)',marginTop:'.5rem',letterSpacing:'2px'}}>{testiIdx+1} od {TESTIMONIALS.length}</p>
          {/* dots */}
          <div className="flex justify-center gap-2 mt-5">
            {TESTIMONIALS.map((_,i)=>(
              <button key={i} onClick={()=>setTestiIdx(i)} style={{width:i===testiIdx?'22px':'5px',height:'5px',borderRadius:i===testiIdx?'3px':'50%',background:i===testiIdx?'var(--cream)':'var(--cream20)',border:'none',transition:'all .3s',cursor:'pointer',padding:0}}/>
            ))}
          </div>
          {/* prev/next */}
          <div className="flex justify-center gap-4 mt-6">
            <button className="btn-book" style={{padding:'.5rem 1rem',fontSize:'.6rem'}} onClick={()=>setTestiIdx(i=>(i-1+TESTIMONIALS.length)%TESTIMONIALS.length)}><span>prev</span></button>
            <button className="btn-book" style={{padding:'.5rem 1rem',fontSize:'.6rem'}} onClick={()=>setTestiIdx(i=>(i+1)%TESTIMONIALS.length)}><span>next</span></button>
          </div>
        </div>
      </section>

      {/* ═══ RADNO VRIJEME ═══════════════════════ */}
      <section id="radno" style={{background:'var(--bg2)',padding:'5rem 2rem'}} className="md:px-16">
        <p data-r="up" style={{fontSize:'.62rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'1rem'}}>Radno vrijeme</p>
        <h2 data-r="up" data-d="1" style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:700,textTransform:'uppercase',letterSpacing:'-1px',color:'var(--cream)',marginBottom:'2.5rem',lineHeight:.92}}>
          Kad smo<br /><span style={{color:'var(--cream50)'}}>tu za tebe.</span>
        </h2>
        <div className="max-w-md" data-r="up" data-d="2">
          {[1,2,3,4,5,6,0].map(d=>{
            const r=RADNO[d]; const isT=d===new Date().getDay()
            return (
              <div key={d} className="flex justify-between items-center py-4" style={{borderBottom:'1px solid var(--cream10)',...(d===1?{borderTop:'1px solid var(--cream10)'}:{})}}>
                <span style={{fontSize:'.78rem',letterSpacing:'2px',textTransform:'uppercase',color:isT?'var(--cream)':'var(--cream50)',fontWeight:isT?600:300,display:'flex',alignItems:'center',gap:'.5rem'}}>
                  {DAYS[d]}{isT&&<span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--cream)',display:'inline-block'}}/>}
                </span>
                <span style={{fontSize:'.9rem',color:isT?'var(--cream)':r?'var(--cream60)':'var(--cream20)',letterSpacing:'1px',fontStyle:r?'normal':'italic',fontWeight:r?400:300}}>
                  {r?r.disp:'Zatvoreno'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══ REZERVACIJA ═════════════════════════ */}
      <section id="rezervacija" style={{background:'var(--bg)',padding:'5rem 2rem'}} className="md:px-16">
        <p data-r="up" style={{fontSize:'.62rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'1rem'}}>Online rezervacija</p>
        <h2 data-r="up" data-d="1" style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:700,textTransform:'uppercase',letterSpacing:'-1px',color:'var(--cream)',marginBottom:'.5rem',lineHeight:.92}}>
          Rezerviraj<br /><span style={{color:'var(--cream50)'}}>termin danas.</span>
        </h2>
        <p data-r="up" data-d="2" style={{fontSize:'.9rem',color:'var(--cream50)',marginBottom:'3rem',lineHeight:'1.8',fontWeight:300}}>Odaberi datum i slobodan termin — čekamo te.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* calendar */}
          <div data-r="left" style={{background:'var(--bg2)',padding:'1.8rem',border:'1px solid var(--cream10)'}}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={()=>setCalM(m=>{if(m===0){setCalY(y=>y-1);return 11}return m-1})} style={{background:'none',border:'1px solid var(--cream10)',color:'var(--cream50)',width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer',fontSize:'.8rem'}}>‹</button>
              <span style={{fontSize:'.85rem',letterSpacing:'2px',textTransform:'uppercase',color:'var(--cream)',fontFamily:"'Josefin Sans'"}}>{MONTHS[calM]} {calY}</span>
              <button onClick={()=>setCalM(m=>{if(m===11){setCalY(y=>y+1);return 0}return m+1})} style={{background:'none',border:'1px solid var(--cream10)',color:'var(--cream50)',width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer',fontSize:'.8rem'}}>›</button>
            </div>
            <div className="grid grid-cols-7 gap-[2px] mb-1">
              {['Pon','Uto','Sri','Čet','Pet','Sub','Ned'].map(d=><div key={d} style={{textAlign:'center',fontSize:'.55rem',letterSpacing:'2px',textTransform:'uppercase',color:'var(--cream20)',padding:'.3rem 0'}}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-[2px]">
              {calDays().map((day,i)=>(
                <div key={i} onClick={()=>!day.empty&&!day.past&&!day.closed&&selectDate(day.ds)}
                  className={`cd${day.empty?' empty':''}${day.past?' past':''}${day.closed&&!day.empty&&!day.past?' closed':''}${day.isT?' today':''}${day.sel?' sel':''}`}>
                  {day.empty?'':day.d}
                </div>
              ))}
            </div>
            {selDate&&(
              <div style={{marginTop:'1.5rem',borderTop:'1px solid var(--cream10)',paddingTop:'1.2rem'}}>
                <p style={{fontSize:'.58rem',letterSpacing:'2.5px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.7rem'}}>slobodni termini</p>
                {slotsLoad?<p style={{fontSize:'.75rem',color:'var(--cream50)'}}>Učitavam...</p>:(
                  <div className="grid grid-cols-4 gap-[3px]">
                    {daySlots.length===0?<p style={{fontSize:'.72rem',color:'var(--cream20)',gridColumn:'1/-1',textAlign:'center'}}>Nema slobodnih termina</p>:
                      daySlots.map(s=>(
                        <button key={s.time} onClick={()=>!s.taken&&setSelTime(s.time)} className={`slot${s.taken?' tk':''}${selTime===s.time?' sl':''}`}>{s.time}</button>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          {/* form */}
          <div data-r="right">
            {!done?(
              <div style={{background:'var(--bg2)',padding:'1.8rem',border:'1px solid var(--cream10)'}}>
                <h3 style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'1rem',fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream)',marginBottom:'.3rem'}}>Rezerviraj termin</h3>
                <p style={{fontSize:'.78rem',color:'var(--cream50)',marginBottom:'1.5rem',fontWeight:300}}>Ispuni podatke i potvrdi.</p>
                {selDate&&selTime&&<div style={{background:'var(--cream10)',borderLeft:'2px solid var(--cream50)',padding:'.5rem .8rem',fontSize:'.72rem',color:'var(--cream)',marginBottom:'1rem',letterSpacing:'1px'}}>{selDate} · {selTime}</div>}
                {[{label:'Ime i prezime *',k:'name',t:'text',ph:'Ana Horvat'},{label:'Telefon *',k:'phone',t:'tel',ph:'091 234 5678'},{label:'Email',k:'email',t:'email',ph:'ana@email.com'}].map(f=>(
                  <div key={f.k} style={{marginBottom:'.8rem'}}>
                    <label style={{display:'block',fontSize:'.58rem',letterSpacing:'2.5px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.4rem'}}>{f.label}</label>
                    <input type={f.t} placeholder={f.ph} value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="fi"/>
                  </div>
                ))}
                <div style={{marginBottom:'.8rem'}}>
                  <label style={{display:'block',fontSize:'.58rem',letterSpacing:'2.5px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.4rem'}}>Usluga *</label>
                  <select value={form.service} onChange={e=>setForm(p=>({...p,service:e.target.value}))} className="fi" style={{appearance:'none'}}>
                    <option value="">— Odaberi —</option>
                    {['Šišanje & feniranje','Bojanje kose','Osvježavanje korijena','Pramenovi / Balayage','Trajna ondulacija','Keratin tretman','Ravnanje kose','Svečana frizura','Konzultacija'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:'.8rem'}}>
                  <label style={{display:'block',fontSize:'.58rem',letterSpacing:'2.5px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.4rem'}}>Napomena</label>
                  <textarea placeholder="Posebni zahtjevi..." rows={3} value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} className="fi" style={{resize:'none'}}/>
                </div>
                <button onClick={submit} disabled={submitting} className="btn-wow mag" style={{width:'100%',justifyContent:'center',opacity:submitting?.4:1}}>
                  <span>{submitting?'Rezerviram...':'Potvrdi rezervaciju'}</span>
                  {!submitting&&<><span className="btn-shimmer"/><span>→</span></>}
                </button>
              </div>
            ):(
              <div style={{background:'var(--bg2)',padding:'3rem 2rem',border:'1px solid var(--cream10)',textAlign:'center'}}>
                <div style={{fontSize:'2rem',color:'var(--cream)',marginBottom:'1rem'}}>✦</div>
                <h4 style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'1rem',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream)',marginBottom:'.5rem'}}>Rezervacija zaprimljena</h4>
                <p style={{fontSize:'.85rem',color:'var(--cream50)',lineHeight:'1.8',fontWeight:300}}>{doneMsg}</p>
                <button onClick={()=>{setDone(false);setSelDate(null);setSelTime(null);setForm({name:'',phone:'',email:'',service:'',note:''})}} className="btn-book mt-8" style={{margin:'2rem auto 0',display:'flex',width:'fit-content'}}>
                  <span>nova rezervacija</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT / FOOTER ════════════════════ */}
      <section id="kontakt" className="relative overflow-hidden" style={{background:'var(--bg)',minHeight:'500px'}}>
        {/* bg photo faded */}
        <div className="absolute inset-0" style={{zIndex:0}}>
          <Image src="/photos/salon-interior.jpg" alt="Salon" fill style={{objectFit:'cover',objectPosition:'center',filter:'brightness(.15)'}} sizes="100vw"/>
        </div>
        <div className="absolute inset-0" style={{zIndex:1,background:'linear-gradient(to right, rgba(21,2,24,.95) 0%, rgba(21,2,24,.7) 60%, rgba(21,2,24,.5) 100%)'}}/>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-16 px-8 md:px-16 py-20" style={{zIndex:2}}>
          <div>
            <p data-r="up" style={{fontSize:'.62rem',letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'1rem'}}>Pronađi nas</p>
            <h2 data-r="up" data-d="1" style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:700,textTransform:'uppercase',letterSpacing:'-1px',color:'var(--cream)',marginBottom:'1rem',lineHeight:.92}}>
              Tvoj savršen<br /><span style={{color:'var(--cream50)'}}>look čeka te.</span>
            </h2>
            <p data-r="up" data-d="2" style={{fontSize:'.9rem',color:'var(--cream50)',lineHeight:'1.8',marginBottom:'2rem',fontWeight:300}}>
              Iskusi stručnu njegu, kreativni styling i salon gdje se osjećaš kao kod kuće.
            </p>
            <button onClick={()=>scrollTo('rezervacija')} className="mag btn-wow" data-r="up" data-d="3">
              <span>rezerviraj sada</span><span className="btn-shimmer"/><span>→</span>
            </button>
          </div>
          <div className="flex flex-col gap-5" data-r="right">
            {/* address */}
            <div>
              <p style={{fontSize:'.55rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.4rem'}}>address</p>
              <p style={{fontSize:'.9rem',color:'var(--cream)',lineHeight:'1.6',fontWeight:300}}>Šenova 7<br/>10000 Zagreb</p>
            </div>
            <div>
              <p style={{fontSize:'.55rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.4rem'}}>phone</p>
              <a href="tel:+385918917760" style={{fontSize:'.9rem',color:'var(--cream)',fontWeight:300,transition:'color .2s'}} onMouseEnter={e=>(e.currentTarget.style.color='var(--cream60)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--cream)')}>091 891 7760</a>
            </div>
            <div>
              <p style={{fontSize:'.55rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.4rem'}}>email</p>
              <a href="mailto:Durdica.pleic@gmail.com" style={{fontSize:'.9rem',color:'var(--cream)',fontWeight:300,transition:'color .2s'}} onMouseEnter={e=>(e.currentTarget.style.color='var(--cream60)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--cream)')}>Durdica.pleic@gmail.com</a>
            </div>
            <div>
              <p style={{fontSize:'.55rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.5rem'}}>Business Hours</p>
              <div style={{fontSize:'.85rem',color:'var(--cream)',fontWeight:300,lineHeight:'1.8'}}>
                <span style={{color:'var(--cream50)'}}>Pon / Sri / Pet:</span> 9:00 – 16:00<br/>
                <span style={{color:'var(--cream50)'}}>Uto / Čet:</span> 12:00 – 19:00<br/>
                <span style={{color:'var(--cream50)'}}>Sub / Ned:</span> Zatvoreno
              </div>
            </div>
            <div>
              <p style={{fontSize:'.55rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.5rem'}}>follow us</p>
              <a href="https://www.facebook.com/people/Frizerski-salon-Fensi/100063899474535/" target="_blank" style={{fontSize:'.85rem',color:'var(--cream)',fontWeight:300,transition:'color .2s'}} onMouseEnter={e=>(e.currentTarget.style.color='var(--cream60)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--cream)')}>Facebook →</a>
            </div>
          </div>
        </div>

        {/* footer strip */}
        <div className="relative border-t flex flex-col md:flex-row items-center justify-between gap-3 px-8 md:px-16 py-5" style={{zIndex:2,borderColor:'var(--cream10)'}}>
          <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'.85rem',fontWeight:700,letterSpacing:'4px',textTransform:'uppercase',color:'var(--cream50)'}}>Fensi</span>
          <span style={{fontSize:'.6rem',color:'var(--cream20)',letterSpacing:'1px'}}>© 2025 Đurđica Pleić · Šenova 7, Zagreb · 091 891 7760</span>
          <div className="flex gap-5">
            {[['usluge','usluge'],['galerija','galerija'],['rezervacija','rezervacija']].map(([l,id])=>(
              <button key={id} onClick={()=>scrollTo(id)} className="nav-link bg-transparent border-0" style={{fontSize:'.58rem'}}>{l}</button>
            ))}
          </div>
        </div>
      </section>

      {/* FAB + Admin trigger */}
      <a href="tel:+385918917760" style={{position:'fixed',bottom:'max(1.5rem,env(safe-area-inset-bottom,1.5rem))',right:'1.5rem',background:'var(--cream)',color:'var(--bg)',width:'50px',height:'50px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',zIndex:90,boxShadow:'0 8px 24px rgba(239,215,202,.2)',animation:'fabF 3s ease-in-out infinite'}}>📞</a>
      <button onClick={()=>setAdminOpen(true)} style={{position:'fixed',bottom:'max(1.5rem,env(safe-area-inset-bottom,1.5rem))',left:'1.5rem',background:'rgba(21,2,24,.8)',color:'var(--cream20)',width:'36px',height:'36px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',zIndex:90,border:'1px solid var(--cream10)',backdropFilter:'blur(10px)'}}>⚙️</button>

      {/* ═══ ADMIN PANEL ═════════════════════════ */}
      {adminOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(21,2,24,.85)',backdropFilter:'blur(16px)',overflowY:'auto'}} onClick={e=>e.target===e.currentTarget&&setAdminOpen(false)}>
          <div style={{maxWidth:'760px',margin:'1.5rem auto',background:'var(--bg2)',border:'1px solid var(--cream10)'}}>
            <div style={{background:'var(--bg3)',padding:'1.2rem 1.6rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--cream10)'}}>
              <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:'.85rem',fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'var(--cream)'}}>Admin · Fensi</span>
              <button onClick={()=>setAdminOpen(false)} style={{background:'none',border:'1px solid var(--cream10)',color:'var(--cream50)',width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem 1.6rem'}}>
              {!adminKey?(
                <div>
                  <label style={{display:'block',fontSize:'.6rem',letterSpacing:'2.5px',textTransform:'uppercase',color:'var(--cream50)',marginBottom:'.5rem'}}>Lozinka</label>
                  <input type="password" placeholder="••••••••" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&adminAuth()} className="fi" style={{marginBottom:'.6rem'}}/>
                  {adminErr&&<p style={{color:'#c87878',fontSize:'.72rem',marginBottom:'.5rem'}}>Pogrešna lozinka</p>}
                  <button onClick={adminAuth} className="btn-wow" style={{width:'100%',justifyContent:'center'}}><span>Prijavi se</span></button>
                </div>
              ):(
                <div>
                  <div style={{display:'flex',borderBottom:'1px solid var(--cream10)',marginBottom:'1rem'}}>
                    {['pending','today','upcoming','all'].map((t,i)=>(
                      <button key={t} onClick={()=>setAdminTab(t)} style={{background:'none',border:'none',borderBottom:`2px solid ${adminTab===t?'var(--cream)':'transparent'}`,padding:'.6rem .9rem',fontSize:'.6rem',letterSpacing:'2px',textTransform:'uppercase',color:adminTab===t?'var(--cream)':'var(--cream50)',cursor:'pointer'}}>
                        {['čekanje','danas','nadolazeći','svi'][i]}
                        {t==='pending'&&pendCnt>0&&<span style={{background:'var(--cream)',color:'var(--bg)',borderRadius:'50%',width:'15px',height:'15px',fontSize:'.55rem',fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center',marginLeft:'.3rem'}}>{pendCnt}</span>}
                      </button>
                    ))}
                  </div>
                  {filtAppts.length===0?<p style={{textAlign:'center',padding:'2rem',color:'var(--cream50)',fontSize:'.85rem',fontStyle:'italic'}}>Nema termina</p>:
                    filtAppts.map(a=>(
                      <div key={a.id} style={{background:'var(--bg3)',borderLeft:a.status==='pending'?'2px solid var(--cream50)':'none',border:'1px solid var(--cream10)',padding:'1rem 1.2rem',marginBottom:'.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
                        <div>
                          <div style={{fontSize:'.85rem',color:'var(--cream)',marginBottom:'.12rem'}}>{a.name} <span style={{fontSize:'.58rem',letterSpacing:'1px',padding:'.1rem .4rem',background:a.status==='pending'?'var(--cream10)':'transparent',color:a.status==='pending'?'var(--cream60)':'var(--cream20)'}}>{a.status==='pending'?'čeka':'ok'}</span></div>
                          <div style={{fontSize:'.7rem',color:'var(--cream50)',fontWeight:300}}>📞 {a.phone}{a.email?` · ${a.email}`:''}</div>
                          <div style={{fontSize:'.68rem',color:'var(--cream60)',marginTop:'.2rem',letterSpacing:'1px'}}>{a.service}</div>
                          {a.note&&<div style={{fontSize:'.65rem',color:'var(--cream20)',marginTop:'.2rem'}}>💬 {a.note}</div>}
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontSize:'.9rem',color:'var(--cream)',letterSpacing:'1px'}}>{a.time}</div>
                          <div style={{fontSize:'.62rem',color:'var(--cream50)'}}>{a.date}</div>
                          {a.status==='pending'&&<button onClick={()=>confirmA(a.id)} style={{background:'none',border:'1px solid var(--cream20)',color:'var(--cream60)',padding:'.22rem .5rem',fontSize:'.6rem',cursor:'pointer',display:'block',marginTop:'.2rem',letterSpacing:'1px'}}>✓ potvrdi</button>}
                          <button onClick={()=>deleteA(a.id,a.date,a.time)} style={{background:'none',border:'1px solid var(--cream10)',color:'var(--cream20)',padding:'.22rem .5rem',fontSize:'.6rem',cursor:'pointer',display:'block',marginTop:'.2rem',letterSpacing:'1px'}}>✕ odbij</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fabF { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes haFallback { to { opacity: 1 !important; } }
        @keyframes scPulse { 0%,100%{opacity:.3} 50%{opacity:.8} }
        .gal-img:hover { transform: scale(1.06) !important; }
        .srv-scroll::-webkit-scrollbar { display:none; }
        [data-r] { will-change: transform, opacity; }
      `}</style>
    </>
  )
}
