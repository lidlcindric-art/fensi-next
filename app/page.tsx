'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

// ─────────────────── TYPES ───────────────────
interface Appointment { id: string; name: string; phone: string; email: string; service: string; date: string; time: string; note: string; status: string }

// ─────────────────── CONSTANTS ───────────────────
const PHOTOS = [
  { src: '/photos/red-waves.jpg', alt: 'Crvena kosa s valovima' },
  { src: '/photos/blonde-waves.jpg', alt: 'Plavi valovi' },
  { src: '/photos/dark-waves-long.jpg', alt: 'Tamna duga kosa' },
  { src: '/photos/straight-blonde.jpg', alt: 'Ravna plava kosa' },
  { src: '/photos/chocolate-waves.jpg', alt: 'Čokoladni valovi' },
]

const GALLERY = [
  { src: '/photos/red-waves.jpg', name: 'Vibrantna Crvena', sub: 'Boja kose' },
  { src: '/photos/bob-highlights.jpg', name: 'Bob s Pramenovima', sub: 'Šišanje' },
  { src: '/photos/blonde-waves.jpg', name: 'Plavi Valovi', sub: 'Boja & valovi' },
  { src: '/photos/dark-waves-long.jpg', name: 'Dugačka Tamna', sub: 'Valovi' },
  { src: '/photos/dark-black-waves.jpg', name: 'Crna & Valovita', sub: 'Styling' },
  { src: '/photos/straight-blonde.jpg', name: 'Ravna Plava', sub: 'Keratin' },
  { src: '/photos/straight-brown.jpg', name: 'Smeđi Keratin', sub: 'Tretman' },
  { src: '/photos/chocolate-waves.jpg', name: 'Čokoladni Valovi', sub: 'Boja & valovi' },
]

const SERVICES = [
  { num: '01', title: 'Oblikuj', img: '/photos/bob-highlights.jpg', desc: 'Od smjelih modernih šišanja do bezvremenih klasika — svaki rez je statement.' },
  { num: '02', title: 'Unaprijedi', img: '/photos/straight-brown.jpg', desc: 'Keratin tretmani, brazilsko ravnanje, regeneracija — svilenkasta glatkoća.' },
  { num: '03', title: 'Osvjetli', img: '/photos/red-waves.jpg', desc: 'Vibrantne boje ili nježni pramenovi — tvoja vizija, naša strast.' },
  { num: '04', title: 'Uzdigni', img: '/photos/dark-waves-long.jpg', desc: 'Svečane frizure, punđe, pletenice. Za tvoj najvažniji trenutak — savršeno.' },
]

const TESTI = [
  { q: 'Došla sam nesigurna što želim, a otišla kao best version of sebe. Svaki put iznova je magic.', a: 'Marija K.' },
  { q: 'Keratin tretman promijenio je moj život. Kosa nikad nije bila ovako sjajna i glatka.', a: 'Ivana M.' },
  { q: 'Svečana frizura za vjenčanje bila je točno ono o čemu sam sanjala. Hvala Đurđici na talentu!', a: 'Ana T.' },
]

const RADNO: Record<number, { disp: string; od: string; do: string } | null> = {
  1: { disp: '9:00 – 16:00', od: '09:00', do: '15:30' },
  2: { disp: '12:00 – 19:00', od: '12:00', do: '18:30' },
  3: { disp: '9:00 – 16:00', od: '09:00', do: '15:30' },
  4: { disp: '12:00 – 19:00', od: '12:00', do: '18:30' },
  5: { disp: '9:00 – 16:00', od: '09:00', do: '15:30' },
  6: null, 0: null,
}
const DAY_NAMES = ['Nedjelja','Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota']
const MONTH_NAMES = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac']

function getSlotsForDay(dow: number): string[] {
  const r = RADNO[dow]; if (!r) return []
  const all: string[] = []
  let h = +r.od.split(':')[0], m = +r.od.split(':')[1]
  const [eh, em] = r.do.split(':').map(Number)
  while (h < eh || (h === eh && m <= em)) {
    all.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    m += 30; if (m >= 60) { m -= 60; h++ }
  }
  return all
}

// ─────────────────── MAIN PAGE ───────────────────
export default function FensiPage() {
  const loaderRef = useRef<HTMLDivElement>(null)
  const loaderInnerRef = useRef<HTMLSpanElement>(null)
  const loaderSubRef = useRef<HTMLDivElement>(null)
  const loaderProgressRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const heroWord1Ref = useRef<HTMLSpanElement>(null)
  const heroWord2Ref = useRef<HTMLSpanElement>(null)
  const heroWord3Ref = useRef<HTMLSpanElement>(null)
  const heroSubRef = useRef<HTMLParagraphElement>(null)
  const heroCtaRef = useRef<HTMLDivElement>(null)
  const heroTagRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Hero slideshow
  const [slideIdx, setSlideIdx] = useState(0)
  const [prevSlide, setPrevSlide] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Testimonials
  const [testiIdx, setTestiIdx] = useState(0)

  // Calendar
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [selDate, setSelDate] = useState<string | null>(null)
  const [selTime, setSelTime] = useState<string | null>(null)
  const [takenSlots, setTakenSlots] = useState<Record<string, string[]>>({})
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Form
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  // Admin
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [adminAppts, setAdminAppts] = useState<Appointment[]>([])
  const [adminTab, setAdminTab] = useState('today')
  const [adminErr, setAdminErr] = useState(false)

  // Nav
  const [navSolid, setNavSolid] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── GSAP + LENIS INIT ──────────────────────────
  useEffect(() => {
    let gsap: any, ScrollTrigger: any, Lenis: any, lenis: any

    const init = async () => {
      const gsapModule = await import('gsap')
      const stModule = await import('gsap/ScrollTrigger')
      const lenisModule = await import('@studio-freight/lenis')

      gsap = gsapModule.gsap
      ScrollTrigger = stModule.ScrollTrigger
      Lenis = lenisModule.default

      gsap.registerPlugin(ScrollTrigger)

      // ── LOADER ──────────────────────────────────────
      const tl = gsap.timeline({
        onComplete: () => {
          if (loaderRef.current) {
            gsap.to(loaderRef.current, { yPercent: -100, duration: .8, ease: 'power3.inOut', onComplete: () => { if (loaderRef.current) loaderRef.current.style.display = 'none' } })
          }
          initAnimations(gsap, ScrollTrigger, lenis)
        }
      })

      tl.to(loaderProgressRef.current, { width: '100%', duration: 1.2, ease: 'power2.inOut' })
        .to(loaderInnerRef.current, { y: 0, duration: .7, ease: 'power3.out' }, '-=.6')
        .to(loaderSubRef.current, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, '-=.3')
        .to({}, { duration: .6 })

      // ── LENIS SMOOTH SCROLL ──────────────────────────
      lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9, infinite: false })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add((t: number) => lenis.raf(t * 1000))
      gsap.ticker.lagSmoothing(0)

      // ── SCROLL PROGRESS ──────────────────────────────
      lenis.on('scroll', ({ progress }: { progress: number }) => {
        if (progressRef.current) progressRef.current.style.width = (progress * 100) + '%'
        setNavSolid(window.scrollY > 80)
      })
    }

    const initAnimations = (gsap: any, ScrollTrigger: any, lenis: any) => {
      // ── HERO TEXT REVEAL ────────────────────────────
      const heroTl = gsap.timeline({ delay: .1 })
      heroTl
        .fromTo(heroTagRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' })
        .fromTo([heroWord1Ref.current, heroWord2Ref.current, heroWord3Ref.current],
          { yPercent: 100 },
          { yPercent: 0, duration: .9, ease: 'power3.out', stagger: .12 }, '-=.3')
        .fromTo(heroSubRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, '-=.4')
        .fromTo(heroCtaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, '-=.4')

      // ── SECTION REVEALS ──────────────────────────────
      document.querySelectorAll('[data-reveal]').forEach(el => {
        const dir = el.getAttribute('data-reveal')
        gsap.fromTo(el,
          { opacity: 0, y: dir === 'up' ? 60 : 0, x: dir === 'left' ? -50 : dir === 'right' ? 50 : 0, scale: dir === 'scale' ? .9 : 1 },
          {
            opacity: 1, y: 0, x: 0, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 60%' },
            delay: +(el.getAttribute('data-d') || 0) * .12,
          }
        )
      })

      // ── IMAGE CLIP-PATH REVEALS ───────────────────────
      document.querySelectorAll('[data-clip]').forEach(el => {
        gsap.fromTo(el,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        )
      })

      // ── ABOUT IMAGES PARALLAX ─────────────────────────
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = +(el.getAttribute('data-parallax') || .2)
        gsap.to(el, {
          yPercent: -15 * speed,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        })
      })

      // ── SERVICES HORIZONTAL DRAG ──────────────────────
      const srvEl = document.querySelector('.srv-scroll') as HTMLElement
      if (srvEl) {
        let isDown = false, startX = 0, scrollLeft = 0
        srvEl.addEventListener('mousedown', e => { isDown = true; srvEl.style.cursor = 'grabbing'; startX = e.pageX - srvEl.offsetLeft; scrollLeft = srvEl.scrollLeft })
        srvEl.addEventListener('mouseleave', () => { isDown = false; srvEl.style.cursor = 'grab' })
        srvEl.addEventListener('mouseup', () => { isDown = false; srvEl.style.cursor = 'grab' })
        srvEl.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - srvEl.offsetLeft; srvEl.scrollLeft = scrollLeft - (x - startX) * 1.5 })
      }

      // ── GALLERY DRAG ──────────────────────────────────
      const galEl = galleryRef.current
      if (galEl) {
        let isDown = false, startX = 0, scrollLeft = 0, velocity = 0, lastX = 0, rafId = 0
        galEl.addEventListener('mousedown', e => { isDown = true; galEl.style.cursor = 'grabbing'; startX = e.pageX; scrollLeft = galEl.scrollLeft; velocity = 0; cancelAnimationFrame(rafId) })
        document.addEventListener('mouseup', () => {
          if (!isDown) return; isDown = false; galEl.style.cursor = 'grab'
          const momentum = () => { galEl.scrollLeft += velocity; velocity *= .92; if (Math.abs(velocity) > .5) rafId = requestAnimationFrame(momentum) }
          momentum()
        })
        galEl.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); const dx = e.pageX - startX; galEl.scrollLeft = scrollLeft - dx; velocity = lastX - e.pageX; lastX = e.pageX })
      }

      // ── MAGNETIC BUTTONS ──────────────────────────────
      document.querySelectorAll('.magnetic').forEach(el => {
        const btn = el as HTMLElement
        btn.addEventListener('mousemove', e => {
          const rect = btn.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          gsap.to(btn, { x: x * .25, y: y * .25, duration: .4, ease: 'power2.out' })
        })
        btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1, .5)' }))
      })
    }

    init()

    return () => { lenis?.destroy(); gsap?.ticker.remove(() => {}) }
  }, [])

  // ── CUSTOM CURSOR ──────────────────────────────
  useEffect(() => {
    let cx = 0, cy = 0, rx = 0, ry = 0, raf: number
    const dot = cursorDotRef.current
    const ring = cursorRingRef.current

    const onMove = (e: MouseEvent) => { cx = e.clientX; cy = e.clientY }
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n
    const render = () => {
      if (dot) { dot.style.left = cx + 'px'; dot.style.top = cy + 'px' }
      rx = lerp(rx, cx, .1); ry = lerp(ry, cy, .1)
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px' }
      raf = requestAnimationFrame(render)
    }
    const onEnter = () => document.body.classList.add('cursor-hover')
    const onLeave = () => document.body.classList.remove('cursor-hover')

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button,.magnetic,.gal-item,.srv-card').forEach(el => {
      el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave)
    })
    render()
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  // ── HERO SLIDESHOW ──────────────────────────────
  const goSlide = useCallback((n: number) => {
    setPrevSlide(slideIdx)
    setSlideIdx((n + PHOTOS.length) % PHOTOS.length)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => goSlide((slideIdx + 1 + PHOTOS.length) % PHOTOS.length), 5000)
  }, [slideIdx])

  useEffect(() => {
    timerRef.current = setInterval(() => setSlideIdx(i => (i + 1) % PHOTOS.length), 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // ── TESTI AUTO-ROTATE ───────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTestiIdx(i => (i + 1) % TESTI.length), 6000)
    return () => clearInterval(t)
  }, [])

  // ── CALENDAR ────────────────────────────────────
  const getSlots = useCallback(async (d: string) => {
    if (takenSlots[d] !== undefined) return takenSlots[d]
    try {
      const r = await fetch(`/api/appointments?view=slots&date=${d}`)
      const data = await r.json()
      const s = data.slots || []
      setTakenSlots(prev => ({ ...prev, [d]: s }))
      return s
    } catch { return [] }
  }, [takenSlots])

  const handleSelectDate = async (ds: string) => {
    setSelDate(ds); setSelTime(null); setSlotsLoading(true)
    const [y, m, d] = ds.split('-').map(Number)
    const dw = new Date(y, m - 1, d).getDay()
    if (!RADNO[dw]) { setSlots([]); setSlotsLoading(false); return }
    const taken = await getSlots(ds)
    const now = new Date()
    const todStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    const isToday = ds === todStr
    const nowM = now.getHours() * 60 + now.getMinutes() + 30
    const dayS = getSlotsForDay(dw)
    const avail = isToday ? dayS.filter(s => { const [sh, sm] = s.split(':').map(Number); return sh * 60 + sm > nowM }) : dayS
    setSlots(avail.filter(s => !taken.includes(s)).concat(avail.filter(s => taken.includes(s)).map(s => `taken:${s}`)))
    setSlotsLoading(false)
  }

  const calDays = () => {
    const first = new Date(calYear, calMonth, 1)
    const startDow = (first.getDay() + 6) % 7
    const total = new Date(calYear, calMonth + 1, 0).getDate()
    const today = new Date()
    const days = []
    for (let i = 0; i < startDow; i++) days.push({ empty: true, d: 0, ds: '' })
    for (let d = 1; d <= total; d++) {
      const dt = new Date(calYear, calMonth, d)
      const past = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const isT = dt.toDateString() === today.toDateString()
      const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const dw = dt.getDay()
      days.push({ empty: false, d, ds, past, isToday: isT, closed: !RADNO[dw], selected: ds === selDate })
    }
    return days
  }

  // ── SUBMIT BOOKING ──────────────────────────────
  const submitBooking = async () => {
    if (!form.name || !form.phone || !form.service) return alert('Ispunite ime, telefon i uslugu.')
    if (!selDate || !selTime) return alert('Odaberite datum i termin.')
    setSubmitting(true)
    try {
      const r = await fetch('/api/appointments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: selDate, time: selTime })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      setTakenSlots(prev => ({ ...prev, [selDate]: [...(prev[selDate] || []), selTime] }))
      const [y, m, d] = selDate.split('-').map(Number)
      const lbl = new Date(y, m - 1, d).toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })
      setSubmitMsg(`${form.name}, vidimo se ${lbl} u ${selTime}. ✦`)
      setSubmitted(true)
    } catch (e: any) { alert(e.message) }
    setSubmitting(false)
  }

  // ── ADMIN ────────────────────────────────────────
  const adminAuth = async () => {
    setAdminErr(false)
    try {
      const r = await fetch('/api/appointments', { headers: { 'x-admin-key': adminPass } })
      if (!r.ok) throw new Error()
      const data = await r.json()
      setAdminAppts(data.appointments || [])
      setAdminKey(adminPass)
    } catch { setAdminErr(true) }
  }

  const confirmAppt = async (id: string) => {
    await fetch(`/api/appointments?id=${id}`, { method: 'PATCH', headers: { 'x-admin-key': adminKey } })
    setAdminAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a))
  }

  const deleteAppt = async (id: string, date: string, time: string) => {
    if (!confirm(`Otkazati ${date} u ${time}?`)) return
    await fetch(`/api/appointments?id=${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } })
    setAdminAppts(prev => prev.filter(a => a.id !== id))
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const filteredAppts = adminTab === 'pending' ? adminAppts.filter(a => a.status === 'pending')
    : adminTab === 'today' ? adminAppts.filter(a => a.date === todayStr)
    : adminTab === 'upcoming' ? adminAppts.filter(a => a.date >= todayStr).slice(0, 30)
    : adminAppts
  const pendingCount = adminAppts.filter(a => a.status === 'pending').length

  return (
    <>
      {/* Custom cursor */}
      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorRingRef} className="cursor-ring" />

      {/* Progress */}
      <div ref={progressRef} id="progress" />

      {/* ── PAGE LOADER ─────────────────────────── */}
      <div ref={loaderRef} className="loader">
        <div className="loader-logo">
          <span ref={loaderInnerRef} className="loader-logo-inner">Fensi</span>
        </div>
        <div ref={loaderSubRef} className="loader-sub" style={{ transform: 'translateY(10px)' }}>frizerski salon</div>
        <div ref={loaderProgressRef} className="loader-progress" />
      </div>

      {/* ── NAV ─────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 md:px-12 py-6 transition-all duration-500"
        style={navSolid ? { background: 'rgba(10,8,6,.93)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(196,164,100,.1)', paddingTop: '1rem', paddingBottom: '1rem' } : {}}
      >
        <a href="#" className="font-['Cormorant_Garamond'] italic text-2xl font-medium tracking-wide leading-none" style={{ color: 'var(--cream)' }}>
          Fensi
          <small className="block not-italic font-['Jost'] text-[.48rem] tracking-[4px] uppercase mt-[.15rem] opacity-40">frizerski salon</small>
        </a>
        <ul className="hidden md:flex gap-8 list-none">
          {['o salonu','usluge','galerija','radno','kontakt'].map(l => (
            <li key={l}>
              <a href={`#${l.replace(' ','')}`}
                className="text-[.62rem] tracking-[3px] uppercase transition-colors duration-200"
                style={{ color: 'rgba(245,241,235,.45)' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--gold)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(245,241,235,.45)'}
              >{l}</a>
            </li>
          ))}
        </ul>
        <button
          className="magnetic hidden md:block text-[.62rem] tracking-[2.5px] uppercase px-5 py-2 rounded-full transition-all duration-300"
          style={{ background: 'transparent', border: '1px solid rgba(196,164,100,.35)', color: 'var(--cream)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--black)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,164,100,.35)'; (e.currentTarget as HTMLElement).style.color = 'var(--cream)' }}
          onClick={() => document.getElementById('rezervacija')?.scrollIntoView({ behavior: 'smooth' })}
        >rezerviraj</button>
        <button className="md:hidden flex flex-col gap-[5px] bg-transparent border-0 p-1" onClick={() => setDrawerOpen(o => !o)}>
          <span className="block w-[22px] h-[1px] transition-all" style={{ background: 'rgba(245,241,235,.7)' }} />
          <span className="block w-[22px] h-[1px] transition-all" style={{ background: 'rgba(245,241,235,.7)' }} />
          <span className="block w-[22px] h-[1px] transition-all" style={{ background: 'rgba(245,241,235,.7)' }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[199]" style={{ background: 'rgba(10,8,6,.7)', backdropFilter: 'blur(8px)' }} onClick={() => setDrawerOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 flex flex-col gap-1 pt-20 px-8" style={{ background: 'var(--dark)' }} onClick={e => e.stopPropagation()}>
            {['o salonu','usluge','galerija','radno','rezervacija','kontakt'].map(l => (
              <a key={l} href={`#${l.replace(' ','')}`} onClick={() => setDrawerOpen(false)}
                className="block py-3 text-[.65rem] tracking-[3px] uppercase border-b transition-colors duration-200"
                style={{ color: 'rgba(245,241,235,.4)', borderColor: 'rgba(245,241,235,.06)' }}>
                {l}
              </a>
            ))}
            <button className="mt-6 py-3 text-[.65rem] tracking-[2px] uppercase rounded-full font-medium" style={{ background: 'var(--gold)', color: 'var(--black)' }} onClick={() => { document.getElementById('rezervacija')?.scrollIntoView({ behavior: 'smooth' }); setDrawerOpen(false) }}>
              Rezerviraj termin
            </button>
          </div>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────── */}
      <section ref={heroRef} id="hero" className="relative flex items-end overflow-hidden" style={{ height: '100dvh', minHeight: '620px', background: 'var(--black)' }}>
        {/* Background photos */}
        {PHOTOS.map((p, i) => (
          <div key={p.src} className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out" style={{ opacity: i === slideIdx ? 1 : 0, zIndex: 0 }}>
            <Image src={p.src} alt={p.alt} fill style={{ objectFit: 'cover', objectPosition: 'center 20%', transform: i === slideIdx ? 'scale(1)' : 'scale(1.06)', transition: 'transform 5s ease', filter: 'brightness(.7)' }} priority={i === 0} sizes="100vw" />
          </div>
        ))}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ zIndex: 1, background: 'linear-gradient(to right, rgba(10,8,6,.75) 0%, rgba(10,8,6,.25) 60%, rgba(10,8,6,.1) 100%), linear-gradient(to top, rgba(10,8,6,.88) 0%, rgba(10,8,6,.35) 45%, rgba(10,8,6,.1) 100%)' }} />

        {/* Vertical side label */}
        <div className="absolute hidden md:block" style={{ left: '2.5rem', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', zIndex: 2, fontSize: '.55rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(245,241,235,.25)' }}>
          vaš salon · zagreb
        </div>

        {/* Slide counter */}
        <div className="absolute hidden md:flex flex-col items-center gap-2" style={{ right: '2.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          <div style={{ width: '1px', height: '50px', background: 'rgba(245,241,235,.12)' }} />
          <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: '.8rem', color: 'rgba(245,241,235,.35)', writingMode: 'vertical-rl' }}>
            {String(slideIdx + 1).padStart(2,'0')} / {String(PHOTOS.length).padStart(2,'0')}
          </span>
          <div style={{ width: '1px', height: '50px', background: 'rgba(245,241,235,.12)' }} />
        </div>

        {/* Slide dots */}
        <div className="absolute flex gap-[6px]" style={{ bottom: '2.5rem', right: '2.5rem', zIndex: 3 }}>
          {PHOTOS.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} style={{ width: i === slideIdx ? '20px' : '5px', height: '5px', borderRadius: i === slideIdx ? '3px' : '50%', background: i === slideIdx ? 'var(--gold)' : 'rgba(245,241,235,.25)', border: 'none', transition: 'all .3s', cursor: 'pointer', padding: 0 }} />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute flex flex-col items-center gap-2" style={{ bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, opacity: 0, animation: 'fadeUp .7s 1.5s forwards' }}>
          <div style={{ width: '1px', height: '45px', background: 'rgba(245,241,235,.18)', animation: 'scrollPulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '.52rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(245,241,235,.28)' }}>scroll down</span>
        </div>

        {/* Hero content */}
        <div className="relative px-6 md:px-16 pb-16 md:pb-24 w-full max-w-3xl" style={{ zIndex: 2 }}>
          <div ref={heroTagRef} className="flex items-center gap-3 mb-7 hero-anim">
            <div style={{ width: '24px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '.58rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--gold)' }}>frizerski salon · zagreb</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond'", fontWeight: 300, lineHeight: .87, letterSpacing: '-2px', fontSize: 'clamp(4rem,14vw,10rem)' }}>
            <span className="split-word"><span ref={heroWord1Ref} className="hw" style={{ display: 'block' }}>Ljepota</span></span>
            <em style={{ fontStyle: 'italic', display: 'block' }}>
              <span className="split-word"><span ref={heroWord2Ref} className="hw" style={{ display: 'block' }}>izvan</span></span>
            </em>
            <span className="split-word" style={{ color: 'var(--gold)' }}>
              <em><span ref={heroWord3Ref} className="hw" style={{ display: 'block', fontStyle: 'italic' }}>granica.</span></em>
            </span>
          </h1>
          <p ref={heroSubRef} className="hero-anim" style={{ fontSize: '.88rem', color: 'rgba(245,241,235,.5)', lineHeight: '1.9', marginTop: '1.8rem', maxWidth: '340px' }}>
            Zajedno stvaramo nešto izvanredno.<br />Frizura koja govori o tebi.
          </p>
          <div ref={heroCtaRef} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-9 hero-anim">
            <button className="magnetic cta-main flex items-center gap-3 px-8 py-4 rounded-full font-medium text-[.65rem] tracking-[2.5px] uppercase transition-all duration-300"
              style={{ background: 'var(--gold)', color: 'var(--black)', border: 'none' }}
              onClick={() => document.getElementById('rezervacija')?.scrollIntoView({ behavior: 'smooth' })}>
              rezerviraj danas <span style={{ fontSize: '.9rem', transition: 'transform .2s' }}>→</span>
            </button>
            <button className="text-[.6rem] tracking-[2.5px] uppercase transition-colors duration-200 bg-transparent border-0"
              style={{ color: 'rgba(245,241,235,.35)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,241,235,.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,241,235,.35)')}
              onClick={() => document.getElementById('galerija')?.scrollIntoView({ behavior: 'smooth' })}>
              vidi radove ↓
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────── */}
      <section id="osalonu" className="grid grid-cols-1 md:grid-cols-2" style={{ background: 'var(--cream)', color: 'var(--black)' }}>
        <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
          <div className="grid grid-cols-2 gap-[3px]" style={{ height: '100%', minHeight: '420px' }}>
            <div className="overflow-hidden relative" data-clip style={{ minHeight: '380px' }}>
              <Image src="/photos/bob-highlights.jpg" alt="Bob" fill style={{ objectFit: 'cover', objectPosition: 'center 15%' }} sizes="25vw" />
            </div>
            <div className="overflow-hidden relative" data-clip style={{ minHeight: '380px', marginTop: '3rem' }}>
              <Image src="/photos/dark-black-waves.jpg" alt="Tamna kosa" fill style={{ objectFit: 'cover', objectPosition: 'center 20%' }} sizes="25vw" />
            </div>
          </div>
          {/* Logo badge */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 py-3 px-5 text-center z-10" style={{ background: 'var(--cream)' }}>
            <div style={{ fontFamily: "'Cormorant Garamond'", fontStyle: 'italic', fontSize: '1.8rem', fontWeight: 500, color: 'var(--black)', lineHeight: 1 }}>Fensi</div>
            <span style={{ fontSize: '.5rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginTop: '.15rem' }}>frizerski salon</span>
          </div>
        </div>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-4" data-reveal="up">
            <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '.6rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>o salonu</span>
          </div>
          <h2 data-reveal="up" data-d="1" style={{ fontFamily: "'Cormorant Garamond'", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-.3px', color: 'var(--black)', marginBottom: '1rem' }}>
            Više od salona —<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>tvoje utočište.</em>
          </h2>
          <p data-reveal="up" data-d="2" style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: '1.9', marginBottom: '.8rem' }}>
            U Fensi salonu vjerujemo u moć kose da transformira, osnažuje i nadahnjuje. Od prvog trenutka dobit ćeš artizam, brigu i posvećenost koja tvoju viziju pretvara u stvarnost.
          </p>
          <p data-reveal="up" data-d="3" style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: '1.9' }}>
            Ovdje svaki detalj ima značenje — jer tvoja kosa priča tvoju priču.
          </p>
          <div className="flex flex-col gap-3 mt-6" data-reveal="up" data-d="4">
            {['Boja, pramenovi & balayage','Keratin tretmani & ravnanje','Valovi & trajna ondulacija','Svečane i svatovske frizure'].map(f => (
              <div key={f} className="flex items-center gap-3 text-[.82rem]" style={{ color: 'var(--black)' }}>
                <div style={{ width: '12px', height: '1px', background: 'var(--gold)', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────── */}
      <section id="usluge" style={{ background: 'var(--dark)', paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div className="px-6 md:px-16 mb-10">
          <div className="flex items-center gap-3 mb-4" data-reveal="up">
            <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '.6rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(196,164,100,.6)' }}>usluge</span>
          </div>
          <h2 data-reveal="up" data-d="1" style={{ fontFamily: "'Cormorant Garamond'", fontSize: 'clamp(2.2rem,6vw,4rem)', fontWeight: 300, letterSpacing: '-.5px', color: 'var(--cream)', lineHeight: 1.05 }}>
            Kosa kao <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>forma<br />umjetnosti</em>
          </h2>
          <p data-reveal="up" data-d="2" style={{ fontSize: '.82rem', color: 'rgba(245,241,235,.38)', marginTop: '.7rem', lineHeight: '1.8', maxWidth: '400px' }}>
            Naše usluge osmišljene su da pretvore tvoju kosu u remek-djelo.
          </p>
        </div>
        <div className="srv-scroll flex gap-[2px] overflow-x-auto px-6 md:px-16 pb-6" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', cursor: 'grab' }}>
          {SERVICES.map(s => (
            <div key={s.num} className="srv-card flex-none" style={{ width: '300px', scrollSnapAlign: 'start', background: 'var(--dark2)', flexShrink: 0 }}>
              <div className="relative overflow-hidden" style={{ height: '280px' }}>
                <Image src={s.img} alt={s.title} fill style={{ objectFit: 'cover', objectPosition: 'center 20%', transition: 'transform .7s ease' }} sizes="300px" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,12,10,.65) 0%, transparent 55%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <div style={{ fontSize: '.58rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(245,241,235,.4)', marginBottom: '.3rem' }}>usluge · {s.num}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.6rem', fontWeight: 500, color: 'var(--cream)' }}>{s.title}</div>
                </div>
              </div>
              <div className="p-5">
                <p style={{ fontSize: '.8rem', color: 'rgba(245,241,235,.42)', lineHeight: '1.7' }}>{s.desc}</p>
                <button className="flex items-center gap-2 mt-4 text-[.62rem] tracking-[2px] uppercase bg-transparent border-0 transition-all duration-200"
                  style={{ color: 'var(--gold)' }}
                  onClick={() => document.getElementById('rezervacija')?.scrollIntoView({ behavior: 'smooth' })}>
                  rezerviraj danas →
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 md:px-16 pt-4">
          <button className="magnetic cta-main flex items-center gap-3 px-8 py-4 rounded-full text-[.65rem] tracking-[2.5px] uppercase font-medium transition-all"
            style={{ background: 'var(--gold)', color: 'var(--black)', border: 'none' }}
            onClick={() => document.getElementById('rezervacija')?.scrollIntoView({ behavior: 'smooth' })}>
            rezerviraj danas →
          </button>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────── */}
      <section id="galerija" style={{ background: 'var(--dark2)', paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div className="px-6 md:px-16 mb-10">
          <div className="flex items-center gap-3 mb-3" data-reveal="up">
            <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '.6rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(196,164,100,.6)' }}>galerija</span>
          </div>
          <h2 data-reveal="up" data-d="1" style={{ fontFamily: "'Cormorant Garamond'", fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 300, letterSpacing: '-.3px', color: 'var(--cream)' }}>
            Inspiriraj se <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>našim radovima.</em>
          </h2>
          <p data-reveal="up" data-d="2" style={{ fontSize: '.78rem', color: 'rgba(245,241,235,.38)', marginTop: '.5rem', lineHeight: '1.8' }}>
            Svaki stil odražava artizam, preciznost i individualnost.
          </p>
        </div>
        <div ref={galleryRef} className="gallery-drag flex gap-[3px] overflow-x-auto pb-3 select-none" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {GALLERY.map((g, i) => (
            <div key={g.src} className="gal-item flex-none group" style={{ width: '260px', position: 'relative', overflow: 'hidden', aspectRatio: '3/4', flexShrink: 0 }}>
              <Image src={g.src} alt={g.name} fill style={{ objectFit: 'cover', objectPosition: 'center 15%', transition: 'transform .6s ease', transform: 'scale(1)' }} sizes="260px"
                className="group-hover:scale-[1.06]" />
              <div className="gal-overlay absolute inset-0 flex flex-col justify-end p-5">
                <div className="gal-name" style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.15rem', color: 'var(--cream)', fontWeight: 500 }}>{g.name}</div>
                <div className="gal-cta" style={{ fontSize: '.55rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginTop: '.3rem' }}>dobij ovaj look →</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section style={{ background: 'var(--black)', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-3 mb-8" data-reveal="up">
          <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontSize: '.6rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(196,164,100,.6)' }}>recenzije</span>
          <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
        </div>
        <div className="max-w-2xl mx-auto" data-reveal="up" data-d="1">
          <p style={{ fontFamily: "'Cormorant Garamond'", fontStyle: 'italic', fontSize: 'clamp(1.3rem,3.5vw,2rem)', fontWeight: 300, color: 'var(--cream)', lineHeight: '1.55', letterSpacing: '-.1px', transition: 'opacity .5s', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            &#x201E;{TESTI[testiIdx].q}&#x201C;
          </p>
          <div style={{ fontSize: '.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginTop: '1.5rem' }}>— {TESTI[testiIdx].a}</div>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {TESTI.map((_, i) => (
            <button key={i} onClick={() => setTestiIdx(i)} style={{ width: i === testiIdx ? '20px' : '5px', height: '5px', borderRadius: i === testiIdx ? '3px' : '50%', background: i === testiIdx ? 'var(--gold)' : 'rgba(245,241,235,.2)', border: 'none', transition: 'all .3s', cursor: 'pointer', padding: 0 }} />
          ))}
        </div>
      </section>

      {/* ── RADNO VRIJEME ────────────────────────── */}
      <section id="radno" style={{ background: 'var(--cream)', color: 'var(--black)', padding: '5rem 2rem' }} className="md:px-16">
        <div className="flex items-center gap-3 mb-4" data-reveal="up">
          <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontSize: '.6rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>radno vrijeme</span>
        </div>
        <h2 data-reveal="up" data-d="1" style={{ fontFamily: "'Cormorant Garamond'", fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 400, letterSpacing: '-.3px', color: 'var(--black)', marginBottom: '2rem' }}>
          Kad smo <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>tu za tebe.</em>
        </h2>
        <div className="max-w-md" data-reveal="up" data-d="2">
          {[1,2,3,4,5,6,0].map(d => {
            const r = RADNO[d]; const isT = d === new Date().getDay()
            return (
              <div key={d} className="rdn-row">
                <span style={{ fontSize: '.78rem', letterSpacing: '1px', color: isT ? 'var(--gold)' : 'var(--muted)', fontWeight: isT ? 500 : 400, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  {DAY_NAMES[d]}
                  {isT && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.05rem', color: isT ? 'var(--gold)' : r ? 'var(--black)' : 'var(--sand)', fontStyle: r ? 'normal' : 'italic', letterSpacing: '.3px' }}>
                  {r ? r.disp : 'Zatvoreno'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── REZERVACIJA ──────────────────────────── */}
      <section id="rezervacija" style={{ background: 'var(--dark)', padding: '5rem 2rem' }} className="md:px-16">
        <div className="flex items-center gap-3 mb-3" data-reveal="up">
          <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontSize: '.6rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'rgba(196,164,100,.5)' }}>online rezervacija</span>
        </div>
        <h2 data-reveal="up" data-d="1" style={{ fontFamily: "'Cormorant Garamond'", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, letterSpacing: '-.3px', color: 'var(--cream)', marginBottom: '.5rem' }}>
          Rezerviraj <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>termin</em><br />kod Đurđice.
        </h2>
        <p data-reveal="up" data-d="2" style={{ fontSize: '.82rem', color: 'rgba(245,241,235,.38)', marginBottom: '2.5rem', lineHeight: '1.8' }}>Odaberi datum i slobodan termin — čekamo te.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div data-reveal="left" style={{ background: 'var(--dark2)', padding: '1.6rem', border: '1px solid rgba(196,164,100,.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setCalMonth(m => { if(m===0){setCalYear(y=>y-1);return 11}return m-1 }) }} style={{ background: 'none', border: '1px solid rgba(245,241,235,.1)', color: 'rgba(245,241,235,.4)', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '.82rem' }}>‹</button>
              <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.1rem', color: 'var(--cream)' }}>{MONTH_NAMES[calMonth]} {calYear}</span>
              <button onClick={() => { setCalMonth(m => { if(m===11){setCalYear(y=>y+1);return 0}return m+1 }) }} style={{ background: 'none', border: '1px solid rgba(245,241,235,.1)', color: 'rgba(245,241,235,.4)', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '.82rem' }}>›</button>
            </div>
            <div className="grid grid-cols-7 gap-[2px] mb-1">
              {['Pon','Uto','Sri','Čet','Pet','Sub','Ned'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '.58rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(245,241,235,.22)', padding: '.3rem 0' }}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-[2px]">
              {calDays().map((day, i) => (
                <div key={i} onClick={() => !day.empty && !day.past && !day.closed && handleSelectDate(day.ds)}
                  className={`cal-day ${day.empty?'empty':''} ${day.past?'past':''} ${day.closed&&!day.empty&&!day.past?'closed':''} ${day.isToday?'today':''} ${day.selected?'selected':''}`}>
                  {day.empty ? '' : day.d}
                </div>
              ))}
            </div>
            {selDate && (
              <div style={{ marginTop: '1.2rem' }}>
                <div style={{ fontSize: '.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(245,241,235,.3)', marginBottom: '.6rem' }}>slobodni termini</div>
                {slotsLoading ? <p style={{ fontSize: '.72rem', color: 'rgba(245,241,235,.3)' }}>Učitavam...</p> : (
                  <div className="grid grid-cols-4 gap-[3px]">
                    {slots.length === 0 ? <p style={{ fontSize: '.72rem', color: 'rgba(245,241,235,.3)', gridColumn: '1/-1', textAlign: 'center' }}>Nema slobodnih termina</p> :
                      slots.map(s => {
                        const isTaken = s.startsWith('taken:')
                        const time = isTaken ? s.replace('taken:','') : s
                        return <button key={s} onClick={() => !isTaken && setSelTime(time)} className={`slot-btn ${isTaken?'taken':''} ${selTime===time?'selected':''}`}>{time}</button>
                      })
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <div data-reveal="right">
            {!submitted ? (
              <div style={{ background: 'var(--dark2)', padding: '1.8rem', border: '1px solid rgba(196,164,100,.08)' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.3rem', color: 'var(--cream)', marginBottom: '.25rem' }}>Rezerviraj termin</h3>
                <p style={{ fontSize: '.75rem', color: 'rgba(245,241,235,.35)', marginBottom: '1.5rem' }}>Ispuni podatke i potvrdi.</p>
                {selDate && selTime && <div style={{ background: 'rgba(196,164,100,.08)', border: '1px solid rgba(196,164,100,.2)', color: 'var(--gold)', fontSize: '.72rem', padding: '.4rem .8rem', marginBottom: '.9rem' }}>✦ {selDate} u {selTime}</div>}
                {[
                  { label: 'Ime i prezime *', key: 'name', type: 'text', ph: 'Ana Horvat' },
                  { label: 'Telefon *', key: 'phone', type: 'tel', ph: '091 234 5678' },
                  { label: 'Email', key: 'email', type: 'email', ph: 'ana@email.com' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: '.85rem' }}>
                    <label style={{ display: 'block', fontSize: '.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,241,235,.3)', marginBottom: '.4rem' }}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', background: 'rgba(245,241,235,.04)', border: '1px solid rgba(245,241,235,.08)', padding: '.78rem 1rem', color: 'var(--cream)', fontSize: '.85rem', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(196,164,100,.4)'} onBlur={e => e.target.style.borderColor = 'rgba(245,241,235,.08)'} />
                  </div>
                ))}
                <div style={{ marginBottom: '.85rem' }}>
                  <label style={{ display: 'block', fontSize: '.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,241,235,.3)', marginBottom: '.4rem' }}>Usluga *</label>
                  <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(245,241,235,.04)', border: '1px solid rgba(245,241,235,.08)', padding: '.78rem 1rem', color: 'var(--cream)', fontSize: '.85rem', outline: 'none', appearance: 'none' }}>
                    <option value="">— Odaberi uslugu —</option>
                    {['Šišanje & feniranje','Bojanje kose (cijela boja)','Osvježavanje korijena','Pramenovi / Balayage','Trajna ondulacija','Keratin tretman','Ravnanje kose','Svečana / svatovska frizura','Konzultacija'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '.85rem' }}>
                  <label style={{ display: 'block', fontSize: '.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,241,235,.3)', marginBottom: '.4rem' }}>Napomena</label>
                  <textarea placeholder="Posebni zahtjevi..." rows={3} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(245,241,235,.04)', border: '1px solid rgba(245,241,235,.08)', padding: '.78rem 1rem', color: 'var(--cream)', fontSize: '.85rem', outline: 'none', resize: 'none' }} />
                </div>
                <button onClick={submitBooking} disabled={submitting} style={{ width: '100%', background: 'var(--gold)', color: 'var(--black)', border: 'none', padding: '.88rem', fontSize: '.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', opacity: submitting ? .4 : 1 }}>
                  {submitting ? 'Rezerviram...' : 'Potvrdi rezervaciju →'}
                </button>
              </div>
            ) : (
              <div style={{ background: 'var(--dark2)', padding: '3rem 2rem', border: '1px solid rgba(196,164,100,.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '.8rem' }}>✦</div>
                <h4 style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '.5rem' }}>Rezervacija zaprimljena!</h4>
                <p style={{ fontSize: '.82rem', color: 'rgba(245,241,235,.4)' }}>{submitMsg}</p>
                <button onClick={() => { setSubmitted(false); setSelDate(null); setSelTime(null); setForm({ name:'',phone:'',email:'',service:'',note:'' }) }}
                  style={{ marginTop: '1.5rem', background: 'none', border: '1px solid rgba(245,241,235,.15)', color: 'rgba(245,241,235,.5)', padding: '.6rem 1.5rem', fontSize: '.62rem', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Nova rezervacija
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────── */}
      <section id="kontakt" className="grid grid-cols-1 md:grid-cols-2" style={{ background: 'var(--cream)', color: 'var(--black)' }}>
        <div className="flex flex-col justify-center px-8 md:px-14 py-16">
          <div className="flex items-center gap-3 mb-4" data-reveal="up">
            <div style={{ width: '16px', height: '1px', background: 'var(--gold)' }} />
            <span style={{ fontSize: '.6rem', letterSpacing: '3.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>kontakt</span>
          </div>
          <h2 data-reveal="up" data-d="1" style={{ fontFamily: "'Cormorant Garamond'", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 400, letterSpacing: '-.3px', color: 'var(--black)', marginBottom: '1.5rem' }}>
            Tvoj savršen<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>look čeka te.</em>
          </h2>
          <div className="flex flex-col gap-4" data-reveal="up" data-d="2">
            {[
              { ic: '📍', lbl: 'adresa', val: 'Šenova 7, 10000 Zagreb', href: undefined },
              { ic: '📞', lbl: 'telefon', val: '091 891 7760', href: 'tel:+385918917760' },
              { ic: '✉️', lbl: 'email', val: 'Durdica.pleic@gmail.com', href: 'mailto:Durdica.pleic@gmail.com' },
              { ic: '📘', lbl: 'facebook', val: 'Frizerski salon Fensi', href: 'https://www.facebook.com/people/Frizerski-salon-Fensi/100063899474535/' },
            ].map(c => (
              <div key={c.lbl} className="flex gap-4 items-start">
                <div style={{ width: '36px', height: '36px', border: '1px solid rgba(14,12,10,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', flexShrink: 0 }}>{c.ic}</div>
                <div>
                  <div style={{ fontSize: '.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.15rem' }}>{c.lbl}</div>
                  {c.href ? <a href={c.href} target={c.href.startsWith('http')?'_blank':undefined} style={{ fontSize: '.88rem', color: 'var(--black)', transition: 'color .2s' }} onMouseEnter={e=>(e.target as HTMLElement).style.color='var(--gold)'} onMouseLeave={e=>(e.target as HTMLElement).style.color='var(--black)'}>{c.val}</a>
                    : <div style={{ fontSize: '.88rem', color: 'var(--black)' }}>{c.val}</div>}
                </div>
              </div>
            ))}
          </div>
          <button className="magnetic cta-main flex items-center gap-3 mt-8 px-8 py-4 text-[.65rem] tracking-[2.5px] uppercase font-medium transition-all"
            data-reveal="up" data-d="3"
            style={{ background: 'var(--black)', color: 'var(--cream)', border: 'none', width: 'fit-content' }}
            onClick={() => document.getElementById('rezervacija')?.scrollIntoView({ behavior: 'smooth' })}>
            rezerviraj termin →
          </button>
        </div>
        <div className="relative overflow-hidden" style={{ minHeight: '350px' }}>
          <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=15.9819%2C45.7751%2C15.9859%2C45.7771&layer=mapnik&marker=45.7761%2C15.9839" style={{ width: '100%', height: '100%', border: 'none', filter: 'grayscale(1) contrast(.85) sepia(.1)', minHeight: '350px' }} loading="lazy" />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer style={{ background: 'var(--black)', borderTop: '1px solid rgba(245,241,235,.06)', padding: '2rem 2rem' }} className="flex flex-col md:flex-row gap-3 items-center justify-between md:px-16 text-center">
        <div style={{ fontFamily: "'Cormorant Garamond'", fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(245,241,235,.4)' }}>Fensi · frizerski salon</div>
        <div style={{ fontSize: '.6rem', color: 'rgba(245,241,235,.2)', letterSpacing: '.5px', lineHeight: '1.7' }}>© 2025 Đurđica Pleić · Šenova 7, Zagreb · 091 891 7760</div>
        <div className="flex gap-5 flex-wrap justify-center">
          {['#usluge','#galerija','#rezervacija','#kontakt'].map(h => (
            <a key={h} href={h} style={{ fontSize: '.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,241,235,.25)', transition: 'color .2s' }}
              onMouseEnter={e=>(e.target as HTMLElement).style.color='var(--gold)'}
              onMouseLeave={e=>(e.target as HTMLElement).style.color='rgba(245,241,235,.25)'}>
              {h.replace('#','')}
            </a>
          ))}
        </div>
      </footer>

      <a href="tel:+385918917760" style={{ position: 'fixed', bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))', right: '1.5rem', background: 'var(--gold)', color: 'var(--black)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', zIndex: 90, boxShadow: '0 8px 24px rgba(196,164,100,.3)', textDecoration: 'none', animation: 'fabF 3s ease-in-out infinite' }}>📞</a>
      <button onClick={() => setAdminOpen(true)} style={{ position: 'fixed', bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))', left: '1.5rem', background: 'rgba(10,8,6,.7)', color: 'rgba(245,241,235,.3)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', zIndex: 90, border: '1px solid rgba(245,241,235,.06)', backdropFilter: 'blur(10px)' }}>⚙️</button>

      {/* ── ADMIN PANEL ──────────────────────────── */}
      {adminOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(10,8,6,.8)', backdropFilter: 'blur(16px)', overflowY: 'auto' }} onClick={e => e.target === e.currentTarget && setAdminOpen(false)}>
          <div style={{ maxWidth: '760px', margin: '1.5rem auto', background: 'var(--dark)', border: '1px solid rgba(196,164,100,.08)' }}>
            <div style={{ background: 'var(--dark2)', padding: '1.3rem 1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(245,241,235,.06)' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.25rem', fontWeight: 400, color: 'var(--cream)' }}>✦ Admin · Fensi</h2>
              <button onClick={() => setAdminOpen(false)} style={{ background: 'none', border: '1px solid rgba(245,241,235,.1)', color: 'rgba(245,241,235,.4)', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem 1.6rem' }}>
              {!adminKey ? (
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '1rem' }}>Prijava vlasnice</h3>
                  <input type="password" placeholder="••••••••" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && adminAuth()}
                    style={{ width: '100%', background: 'rgba(245,241,235,.04)', border: '1px solid rgba(245,241,235,.08)', padding: '.78rem 1rem', color: 'var(--cream)', fontSize: '.85rem', outline: 'none', marginBottom: '.6rem' }} />
                  {adminErr && <p style={{ color: '#c87878', fontSize: '.72rem', marginBottom: '.5rem' }}>Pogrešna lozinka</p>}
                  <button onClick={adminAuth} style={{ width: '100%', background: 'var(--gold)', color: 'var(--black)', border: 'none', padding: '.78rem', fontSize: '.65rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer' }}>Prijavi se</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(245,241,235,.06)', marginBottom: '1rem' }}>
                    {['pending','today','upcoming','all'].map((t,i) => (
                      <button key={t} onClick={() => setAdminTab(t)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${adminTab===t?'var(--gold)':'transparent'}`, padding: '.6rem .9rem', fontSize: '.62rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: adminTab===t?'var(--gold)':'rgba(245,241,235,.3)', cursor: 'pointer' }}>
                        {['čekanje','danas','nadolazeći','svi'][i]}{t==='pending'&&pendingCount>0&&<span style={{ background: 'var(--gold)', color: 'var(--black)', borderRadius: '50%', width: '16px', height: '16px', fontSize: '.58rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '.35rem', verticalAlign: 'middle' }}>{pendingCount}</span>}
                      </button>
                    ))}
                  </div>
                  {filteredAppts.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(245,241,235,.25)', fontFamily: "'Cormorant Garamond'", fontStyle: 'italic' }}>Nema termina</div> :
                    filteredAppts.map(a => (
                      <div key={a.id} style={{ background: 'var(--dark2)', border: `1px solid ${a.status==='pending'?'rgba(196,164,100,.2)':'rgba(245,241,235,.05)'}`, borderLeft: a.status==='pending'?'2px solid var(--gold)':'1px solid rgba(245,241,235,.05)', padding: '1rem 1.2rem', marginBottom: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '.85rem', color: 'var(--cream)', marginBottom: '.12rem' }}>{a.name} <span style={{ fontSize: '.58rem', letterSpacing: '1px', textTransform: 'uppercase', padding: '.12rem .45rem', background: a.status==='pending'?'rgba(196,164,100,.1)':'rgba(245,241,235,.05)', color: a.status==='pending'?'var(--gold)':'rgba(245,241,235,.3)' }}>{a.status==='pending'?'čeka':'ok'}</span></div>
                          <div style={{ fontSize: '.7rem', color: 'rgba(245,241,235,.35)' }}>📞 {a.phone}{a.email?` · ${a.email}`:''}</div>
                          <div style={{ fontSize: '.68rem', background: 'rgba(196,164,100,.08)', color: 'var(--gold)', padding: '.12rem .5rem', display: 'inline-block', marginTop: '.22rem' }}>{a.service}</div>
                          {a.note && <div style={{ fontSize: '.65rem', color: 'rgba(245,241,235,.3)', marginTop: '.2rem' }}>💬 {a.note}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: '1.05rem', color: 'var(--cream)' }}>{a.time}</div>
                          <div style={{ fontSize: '.65rem', color: 'rgba(245,241,235,.25)' }}>{a.date}</div>
                          {a.status==='pending'&&<button onClick={() => confirmAppt(a.id)} style={{ background: 'none', border: '1px solid rgba(196,164,100,.25)', color: 'var(--gold)', padding: '.25rem .5rem', fontSize: '.62rem', cursor: 'pointer', display: 'block', marginTop: '.22rem' }}>✓ Potvrdi</button>}
                          <button onClick={() => deleteAppt(a.id, a.date, a.time)} style={{ background: 'none', border: '1px solid rgba(245,241,235,.1)', color: 'rgba(245,241,235,.3)', padding: '.25rem .5rem', fontSize: '.62rem', cursor: 'pointer', display: 'block', marginTop: '.22rem' }}>✕ Odbij</button>
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
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:none } }
        @keyframes scrollPulse { 0%,100% { opacity:.3; transform:scaleY(1) } 50% { opacity:1; transform:scaleY(1.15) } }
        @keyframes fabF { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }
        .srv-scroll::-webkit-scrollbar { display:none }
        .gallery-drag::-webkit-scrollbar { display:none }
        .srv-scroll { cursor: grab; }
        .srv-scroll:active { cursor: grabbing; }
        [data-d="1"] { transition-delay:.12s }
        [data-d="2"] { transition-delay:.24s }
        [data-d="3"] { transition-delay:.36s }
        [data-d="4"] { transition-delay:.48s }
      `}</style>
    </>
  )
}
