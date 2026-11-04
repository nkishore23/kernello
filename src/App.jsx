import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { NUTS, STORY, SHOP, JAR_VIDEO, WEIGHTS, price, FREE_SHIP, MARQUEE, STATS, REVIEWS, SUBSCRIBE_URL, FESTIVAL, GIFTS, INFO } from './data'

const clamp = (n, a, b) => Math.min(b, Math.max(a, n))
// phones get the smaller "-m" video; every video has a .jpg poster so something shows instantly
const MOBILE = typeof matchMedia !== 'undefined' && matchMedia('(max-width:700px)').matches
const V = (p) => (MOBILE ? p.replace('.mp4', '-m.mp4') : p)
const P = (p) => p.replace('.mp4', '.jpg')
const wa = (text) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`

export default function App() {
  const [ready, setReady] = useState(false)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kernello-cart') || '[]') } catch { return [] }
  })
  useEffect(() => { try { localStorage.setItem('kernello-cart', JSON.stringify(cart)) } catch { /* ignore */ } }, [cart])
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [missing, setMissing] = useState([])
  const bar = useRef(null)

  useEffect(() => { document.title = `${SHOP.name} | Premium Nuts` }, [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t) }, [toast])

  // scroll progress bar
  useEffect(() => {
    const on = () => { bar.current.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})` }
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])

  // scroll-driven effects: hero fade/zoom, scroll-linked marquee, card parallax
  useEffect(() => {
    let last = scrollY, tick = false
    const run = () => {
      tick = false
      const y = scrollY, v = y - last; last = y
      const hero = document.getElementById('nuts')
      if (hero) hero.style.setProperty('--hp', clamp(y / innerHeight, 0, 1).toFixed(3))
      const sk = clamp(-v * 0.25, -10, 10)
      document.querySelectorAll('.mtrack').forEach((t, n) => {
        const half = t.scrollWidth / 2
        const o = (y * 0.55) % half
        t.style.transform = `translate3d(${n ? o - half : -o}px,0,0) skewX(${n ? -sk : sk}deg)`
      })
      document.querySelectorAll('.card').forEach((c) => {
        const r = c.getBoundingClientRect()
        c.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) / innerHeight * -34).toFixed(1) + 'px')
      })
    }
    const on = () => { if (!tick) { tick = true; requestAnimationFrame(run) } }
    run(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])

  // show a clear warning if any video file is missing / wrongly named
  useEffect(() => {
    const on = (e) => {
      if (e.target.tagName !== 'VIDEO') return
      const p = new URL(e.target.src).pathname
      setMissing((m) => (m.includes(p) ? m : [...m, p]))
    }
    document.addEventListener('error', on, true)
    return () => document.removeEventListener('error', on, true)
  }, [])

  // reveal on scroll
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.15 })
    document.querySelectorAll('.rv').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : '' }, [menu])

  useEffect(() => {
    const lenis = new Lenis({ anchors: true })
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    const t = setTimeout(() => setReady(true), 800)
    return () => { cancelAnimationFrame(id); lenis.destroy(); clearTimeout(t) }
  }, [])

  const addItem = (it) => {
    setCart((c) => (c.find((x) => x.k === it.k) ? c.map((x) => (x.k === it.k ? { ...x, q: x.q + 1 } : x)) : [...c, { ...it, q: 1 }]))
    setToast(`${it.name} added`)
  }
  const add = (nut, w) => addItem({ k: nut.id + w, name: `${nut.name} ${w}g`, sub: w + 'g', color: nut.color, unit: price(nut, w) })
  const qty = (k, d) => setCart((c) => c.map((x) => (x.k === k ? { ...x, q: x.q + d } : x)).filter((x) => x.q > 0))
  const count = cart.reduce((s, x) => s + x.q, 0)

  return (
    <>
      <div className={'letterbox' + (ready ? ' open' : '')}>
        <i /><i /><b>{SHOP.name}</b>
      </div>
      <nav className="nav">
        <a href="#top" className="logo">{SHOP.name}</a>
        <a className="dl" href="#nuts">Nuts</a><a className="dl" href="#story">Story</a><a className="dl" href="#build">Build</a><a className="dl" href="#shop">Shop</a><a className="dl" href="#gifts">Gifts</a>
        <button className="bag" onClick={() => setOpen(true)}>Bag · {count}</button>
        <button className={'burger' + (menu ? ' x' : '')} onClick={() => setMenu(!menu)} aria-label="Menu"><i /><i /></button>
      </nav>
      <div className={'mmenu' + (menu ? ' on' : '')} data-lenis-prevent>
        {[['Nuts', '#nuts'], ['Story', '#story'], ['Build', '#build'], ['Shop', '#shop'], ['Gifts', '#gifts']].map(([t, h], k) => (
          <a key={t} href={h} style={{ transitionDelay: menu ? k * 70 + 150 + 'ms' : '0ms' }} onClick={() => setMenu(false)}>{t}</a>
        ))}
        <button style={{ transitionDelay: menu ? '450ms' : '0ms' }} onClick={() => { setMenu(false); setOpen(true) }}>Open bag · {count}</button>
      </div>
      <main id="top">
        <Hero add={add} />
        <Marquee />
        <Festival />
        <Story />
        <Proof />
        <Builder onAdd={addItem} />
        <Shop add={add} />
        <Gifts onAdd={addItem} />
        <Reviews />
        <Footer />
      </main>
      <Cart open={open} onClose={() => setOpen(false)} cart={cart} qty={qty} />
      <div className="prog" ref={bar} />
      {missing.length > 0 && (
        <div className="miss"><b>Videos not found:</b> {missing.join(', ')}<br />Put them inside <code>public/video/</code> with these exact names, then refresh.</div>
      )}
      <div className={'toast' + (toast ? ' on' : '')}><span>✓ {toast}</span><button onClick={() => { setOpen(true); setToast('') }}>View bag</button></div>
      <a className="wafab" href={wa('Hi! I have a question about your nuts')} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg><span>Chat with us</span></a>
      <div className="grain" />
    </>
  )
}

function Hero({ add }) {
  const [i, setI] = useState(0)
  const refs = useRef([])
  useEffect(() => {
    refs.current.forEach((v, n) => {
      if (!v) return
      if (n === i) { v.currentTime = 0; v.play().catch(() => {}) } else v.pause()
    })
    const t = setTimeout(() => setI((x) => (x + 1) % NUTS.length), 9000)
    return () => clearTimeout(t)
  }, [i])
  const n = NUTS[i]
  return (
    <section id="nuts" className={'hero ' + (n.dark ? 'dark' : 'light')} style={{ '--c': n.color }}>
      {NUTS.map((x, k) => (
        <video key={x.id} ref={(el) => (refs.current[k] = el)} className={'hv' + (k === i ? ' on' : '')}
          src={V(x.video)} poster={P(x.video)} muted playsInline loop preload={k === i ? 'auto' : 'none'} />
      ))}
      <div className="scrim" />
      <div className="htext" key={n.id}>
        <small>0{i + 1} / 0{NUTS.length}</small>
        <em>{n.origin}</em>
        <h1>{n.name}</h1>
        <p>{n.desc}</p>
        <div className="chips">{n.chips.map((c) => <span key={c}>{c}</span>)}</div>
        <div className="buy"><b>₹{n.price}<sup> / 500g</sup></b><button onClick={() => add(n, 500)}>Add to bag</button></div>
      </div>
      <div className="hint"><span>Scroll</span><i /></div>
      <div className="pills">
        {NUTS.map((x, k) => (
          <button key={x.id} className={k === i ? 'act' : ''} onClick={() => setI(k)} aria-label={x.name}>
            <span style={{ background: x.color }} />{k === i && x.name}
          </button>
        ))}
      </div>
    </section>
  )
}

function Story() {
  const box = useRef(null)
  const refs = useRef([])
  const [idx, setIdx] = useState(0)
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => {
      const r = box.current.getBoundingClientRect()
      const pr = clamp(-r.top / (r.height - innerHeight), 0, 0.999)
      setP(pr); setIdx(Math.floor(pr * STORY.length))
      box.current.style.setProperty('--bp', (pr * STORY.length - Math.floor(pr * STORY.length)).toFixed(3))
    }
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    refs.current.forEach((v, n) => { if (!v) return; n === idx ? v.play().catch(() => {}) : v.pause() })
  }, [idx])
  return (
    <section id="story" ref={box} className="story">
      <div className="pin">
        {STORY.map((s, k) => (
          <video key={k} ref={(el) => (refs.current[k] = el)} className={k === idx ? 'on' : ''} src={V(s.video)} poster={P(s.video)} muted playsInline loop preload={Math.abs(k - idx) <= 1 ? 'metadata' : 'none'} />
        ))}
        <div className="shade" />
        <span className="eyebrow">From farm to your hands</span>
        <h2 key={idx}>{STORY[idx].cap[0]} <em>{STORY[idx].cap[1]}</em></h2>
        <div className="bar"><i style={{ height: p * 100 + '%' }} /></div>
        <span className="count">0{idx + 1} / 0{STORY.length}</span>
      </div>
    </section>
  )
}

function Builder({ onAdd }) {
  const [layers, setLayers] = useState([])
  const used = layers.map((id) => NUTS.find((n) => n.id === id))
  const grams = layers.length * 50
  const kcal = Math.round(used.reduce((s, n) => s + n.kcal * 0.5, 0))
  const prot = Math.round(used.reduce((s, n) => s + n.protein * 0.5, 0))
  const cost = used.reduce((s, n) => s + Math.round(n.price / 10), 0)
  const bg = used.length ? used[used.length - 1].color : '#F3E9D7'
  return (
    <section id="build" className="build" style={{ background: bg }}>
      <h2 className="rv">Crack it. <em>Mix it.</em> Snap it.</h2>
      <div className="bgrid rv">
        <div className="vwrap"><LazyVideo src={V(JAR_VIDEO)} poster={P(JAR_VIDEO)} /></div>
        <div className="panel">
          <p className="lbl">Pick up to three nuts</p>
          <div className="picker">
            {NUTS.map((n) => (
              <button key={n.id} disabled={layers.length >= 3} onClick={() => setLayers([...layers, n.id])}>
                <i style={{ background: n.color }} />{n.name}
              </button>
            ))}
          </div>
          <div className="row">
            <button className="ghost" onClick={() => setLayers(layers.slice(0, -1))}>Undo</button>
            <button className="ghost" onClick={() => setLayers([])}>Reset</button>
          </div>
          <div className="jarrow">
            <div className="jar">{used.map((n, k) => <span key={k} style={{ background: n.color }} />)}</div>
            <ol>{used.length ? used.map((n, k) => <li key={k}>{n.name}</li>) : <li className="mute">Your jar is empty</li>}</ol>
          </div>
          <div className="stats">
            <div><b>{grams}g</b><small>total weight</small></div>
            <div><b>{kcal}</b><small>kcal</small></div>
            <div><b>{prot}g</b><small>protein</small></div>
          </div>
          <button className={'cta' + (layers.length ? '' : ' off')}
            onClick={() => { onAdd({ k: 'jar-' + layers.join('-'), name: 'Custom jar', sub: used.map((n) => n.name).join(' + '), color: bg, unit: cost }); setLayers([]) }}>
            Add jar to bag{layers.length ? ` · ₹${cost}` : ''}
          </button>
        </div>
      </div>
    </section>
  )
}

function Shop({ add }) {
  const [w, setW] = useState({})
  const [sel, setSel] = useState(null)
  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-8px)`
  }
  const untilt = (e) => { e.currentTarget.style.transform = '' }
  return (
    <section id="shop" className="shop">
      <h2 className="rv">The <em>range.</em></h2>
      <div className="cards">
        {NUTS.map((n, k) => {
          const cw = w[n.id] || 500
          return (
            <article key={n.id} className="card rv" style={{ background: n.color, '--d': k * 0.1 + 's' }} onMouseMove={tilt} onMouseLeave={untilt}>
              <div className="vclip" onClick={() => setSel(n)} style={{ cursor: 'pointer' }}>
                <video src={V(n.video)} poster={P(n.video)} muted loop playsInline preload="none"
                  onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
              </div>
              <div className={'cinfo ' + (n.dark ? 'dark' : 'light')}>
                <h3>{n.name}</h3><small>{n.origin} · <u className="dt" onClick={() => setSel(n)}>Details</u></small>
                <div className="wts">{WEIGHTS.map((x) => (
                  <button key={x} className={x === cw ? 'act' : ''} onClick={() => setW({ ...w, [n.id]: x })}>{x >= 1000 ? '1kg' : x + 'g'}</button>
                ))}</div>
                <div className="buy"><b>₹{price(n, cw)}</b><button className="plus" onClick={() => add(n, cw)}>+</button></div>
              </div>
            </article>
          )
        })}
      </div>
      {sel && <Modal nut={sel} onClose={() => setSel(null)} add={add} />}
    </section>
  )
}

function Footer() {
  const [email, setEmail] = useState('')
  const [st, setSt] = useState('idle')
  const go = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setSt('bad'); return }
    setSt('busy')
    try {
      if (SUBSCRIBE_URL) {
        const r = await fetch(SUBSCRIBE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email }) })
        if (!r.ok) throw new Error('fail')
      } else {
        window.open(wa(`Hi! Please add me to your updates list. My email: ${email}`), '_blank')
      }
      setSt('ok'); setEmail('')
    } catch { setSt('err') }
  }
  const msg = { bad: 'Please enter a valid email.', ok: 'You\u2019re in! Fresh batches coming your way 🥜', err: 'Something went wrong. Try again?' }[st]
  return (
    <footer className="foot">
      <h2 className="rv">Get the <em>crunch.</em></h2>
      <p>New harvests, drops and the odd free jar. No spam, only shells.</p>
      <div className="mail">
        <input placeholder="you@email.com" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSt('idle') }} onKeyDown={(e) => e.key === 'Enter' && go()} />
        <button onClick={go} disabled={st === 'busy'}>{st === 'busy' ? 'Sending…' : st === 'ok' ? 'Subscribed ✓' : 'Subscribe'}</button>
      </div>
      <div className={'mailmsg ' + st}>{msg}</div>
      <div className="links"><a href="#shop">Shop</a><a href={wa('Hi! Wholesale enquiry')} target="_blank" rel="noreferrer">Wholesale</a>
        <a href={wa('Hi! Gifting enquiry')} target="_blank" rel="noreferrer">Gifting</a><a href={wa('Hi!')} target="_blank" rel="noreferrer">WhatsApp</a></div>
      <div className="mark" style={{ fontSize: `clamp(28px, ${(110 / SHOP.name.length).toFixed(2)}vw, 176px)` }}>{SHOP.name}</div>
    </footer>
  )
}

function Cart({ open, onClose, cart, qty }) {
  const [pin, setPin] = useState('')
  const eta = pin.length < 6 ? '' : /^60[0-3]/.test(pin) ? 'Chennai: delivery tomorrow 🚚' : pin[0] === '6' ? 'Delivery in 2–3 days' : 'Delivery in 4–6 days'
  const total = cart.reduce((s, x) => s + x.unit * x.q, 0)
  const left = Math.max(0, FREE_SHIP - total)
  const msg = `Hi! I'd like to order:\n` + cart.map((x) => `• ${x.name} (${x.sub}) × ${x.q} = ₹${x.unit * x.q}`).join('\n') + `\nTotal: ₹${total}`
  return (
    <>
      <div className={'veil' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'drawer' + (open ? ' on' : '')} data-lenis-prevent>
        <header><h3>Your bag</h3><button onClick={onClose}>✕</button></header>
        <div className="ship">
          <small>{cart.length && left === 0 ? '🎉 Free delivery unlocked!' : `Add ₹${left} more for free delivery`}</small>
          <div><i style={{ width: Math.min(100, (total / FREE_SHIP) * 100) + '%' }} /></div>
        </div>
        <div className="pin">
          <input inputMode="numeric" maxLength={6} placeholder="Enter pincode" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
          <span>{eta || 'Check delivery time'}</span>
        </div>
        <div className="items">
          {!cart.length && <p className="mute">Nothing here yet. Crack on!</p>}
          {cart.map((x) => (
            <div key={x.k} className="item">
              <i style={{ background: x.color }} />
              <span>{x.name}<small>{x.sub}</small></span>
              <div><button onClick={() => qty(x.k, -1)}>−</button>{x.q}<button onClick={() => qty(x.k, 1)}>+</button></div>
              <b>₹{x.unit * x.q}</b>
            </div>
          ))}
        </div>
        <footer><div><span>Total</span><b>₹{total}</b></div>
          {cart.length
            ? <a className="cta" target="_blank" rel="noreferrer" href={wa(msg)}>Checkout on WhatsApp</a>
            : <span className="cta off">Checkout on WhatsApp</span>}
        </footer>
      </aside>
    </>
  )
}

function Marquee() {
  return (
    <div className="marquee">
      {[0, 1].map((n) => {
        const row = n ? [...MARQUEE].reverse() : MARQUEE
        return <div key={n} className={'mtrack mt' + n}>{[0, 1, 2, 3].map((r) => row.map((t, k) => <span key={r + '-' + k}>{t}</span>))}</div>
      })}
    </div>
  )
}

function Count({ to, suf }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const step = (t) => { const p = Math.min(1, (t - t0) / 1800); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step) }
      requestAnimationFrame(step)
    }, { threshold: 0.5 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [to])
  return <b ref={ref}>{n.toLocaleString('en-IN')}<span>{suf}</span></b>
}

function Proof() {
  return (
    <section className="proof"><div className="sgrid">
      {STATS.map((s, k) => <div key={s.label} className="rv" style={{ '--d': k * 0.12 + 's' }}><Count to={s.to} suf={s.suf} /><small>{s.label}</small></div>)}
    </div></section>
  )
}

function Reviews() {
  return (
    <section className="reviews">
      <h2 className="rv">Loved by <em>snackers.</em></h2>
      <div className="rgrid">
        {REVIEWS.map((r, k) => (
          <figure key={r.n} className="rv" style={{ '--d': k * 0.12 + 's' }}>
            <div className="stars">★★★★★</div>
            <blockquote>“{r.q}”</blockquote>
            <figcaption><b>{r.n}</b><small>{r.c}</small></figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Festival() {
  const [t, setT] = useState(() => new Date(FESTIVAL.date) - Date.now())
  useEffect(() => { const id = setInterval(() => setT(new Date(FESTIVAL.date) - Date.now()), 1000); return () => clearInterval(id) }, [])
  if (t <= 0) return null
  const p = (n) => String(n).padStart(2, '0')
  return (
    <a href="#gifts" className="fest">
      <span>🪔 {FESTIVAL.line}</span>
      <b>{Math.floor(t / 864e5)}d {p(Math.floor(t / 36e5) % 24)}h {p(Math.floor(t / 6e4) % 60)}m {p(Math.floor(t / 1e3) % 60)}s</b>
      <u>Shop gifts →</u>
    </a>
  )
}

function Gifts({ onAdd }) {
  return (
    <section id="gifts" className="gifts">
      <h2 className="rv">Gift <em>boxes.</em></h2>
      <div className="ggrid">
        {GIFTS.map((g, k) => (
          <article key={g.id} className="gcard rv" style={{ '--d': k * 0.12 + 's' }}>
            <GiftVid src={`/gifts/gift-${g.id}.mp4`} />
            <h3>{g.name}</h3><p>{g.desc}</p>
            <div className="buy"><b>₹{g.price}</b>
              <button className="plus" aria-label="Add" onClick={() => onAdd({ k: 'gift-' + g.id, name: g.name, sub: g.desc, color: '#F7C873', unit: g.price })}>+</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Modal({ nut, onClose, add }) {
  const i = INFO[nut.id]
  const roast = new Date(Date.now() - 2 * 864e5).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [onClose])
  return (
    <>
      <div className="veil on" onClick={onClose} />
      <div className={'modal ' + (nut.dark ? 'dark' : 'light')} style={{ background: nut.color }} data-lenis-prevent>
        <button className="x" onClick={onClose} aria-label="Close">✕</button>
        <video src={V(nut.video)} poster={P(nut.video)} autoPlay muted loop playsInline />
        <div className="mbody">
          <small>{nut.origin}</small><h3>{nut.name}</h3><p>{nut.desc}</p>
          <div className="nf">
            <div><b>{nut.kcal}</b>kcal</div><div><b>{nut.protein}g</b>protein</div><div><b>{i.fat}g</b>fat</div><div><b>{i.fibre}g</b>fibre</div>
          </div>
          <small>Nutrition per 100g</small>
          <p><b>How to enjoy:</b> {i.eat}</p>
          <div className="badges"><span>FSSAI Lic. No. 1000XXXXXXXX</span><span>Roasted on {roast}</span></div>
          <div className="buy"><b>₹{nut.price}<sup> / 500g</sup></b><button onClick={() => { add(nut, 500); onClose() }}>Add to bag</button></div>
        </div>
      </div>
    </>
  )
}

function GiftVid({ src }) {
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      const v = ref.current
      if (!v) return
      if (e.isIntersecting) v.play().catch(() => {}); else v.pause()
    }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <div className="gvid"><video ref={ref} src={V(src)} poster={P(src)} muted loop playsInline preload="none" /></div>
}

function LazyVideo({ src, poster }) {
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      const v = ref.current
      if (!v) return
      if (e.isIntersecting) v.play().catch(() => {}); else v.pause()
    }, { threshold: 0.25 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" />
}
