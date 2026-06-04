// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

import bee    from '@/assets/bee.jpg';
import laptop from '@/assets/laptop.jpg';
import hex1   from '@/assets/hex1.jpg';
import hex2   from '@/assets/hex2.jpg';

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────
const TICKER = [
  'Academic Writing','Freelancing','Video Watching','Paid Surveys',
  'App Testing','Data Entry','Social Promotion','Crypto Tasks','US Phone Numbers',
];

const CATEGORIES = [
  { emoji:'🎓', name:'Academic Writing', earn:'$10–$50',  slug:'academic-writing' },
  { emoji:'💼', name:'Freelancing',      earn:'$20–$100', slug:'freelancing' },
  { emoji:'▶️', name:'Watch Videos',     earn:'$5–$20',   slug:'watching-videos' },
  { emoji:'📋', name:'Surveys',          earn:'$2–$10',   slug:'surveys' },
  { emoji:'📱', name:'App Testing',      earn:'$5–$25',   slug:'app-testing' },
  { emoji:'⌨️', name:'Data Entry',       earn:'$10–$30',  slug:'data-entry' },
  { emoji:'📣', name:'Social Media',     earn:'$5–$20',   slug:'social-media' },
  { emoji:'₿',  name:'Crypto Tasks',     earn:'$10–$50',  slug:'crypto-tasks' },
];

const TESTIMONIALS = [
  { av:'👩',   name:'Sarah M.',  text:'TaskHive has completely changed the way I earn online. Tasks are legit and payments are always on time.' },
  { av:'👨',   name:'James K.',  text:"Great platform with real opportunities. I've earned more than I expected. Highly recommended!" },
  { av:'👩‍💼', name:'Emily R.',  text:'The US number subscription works perfectly for all my verification needs. Worth every penny.' },
];

// ─────────────────────────────────────────────────────────────
// PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────
function useParticleCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, animId;
    let mouse = { x: 0, y: 0 };

    function resize() {
      const parent = canvas.parentElement;
      width  = canvas.width  = parent ? parent.offsetWidth  : window.innerWidth;
      height = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const GOLD   = 'rgba(212,168,67,';
    const SUBTLE = 'rgba(50,55,90,';

    const particles = Array.from({ length: 120 }, () => ({
      x:    Math.random() * 1920,
      y:    Math.random() * 1080,
      r:    Math.random() * 1.6 + 0.3,
      vx:   (Math.random() - 0.5) * 0.25,
      vy:   (Math.random() - 0.5) * 0.25,
      gold: Math.random() > 0.72,
      op:   Math.random() * 0.7 + 0.2,
    }));

    function hexPath(ctx, cx, cy, r, angle = 0) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + angle;
        i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
                : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
    }

    const hexes = [
      { x:0.78, y:0.22, r:55, angle:0,   speed:0.004,  op:0.18, gold:true  },
      { x:0.88, y:0.60, r:80, angle:0.5, speed:0.003,  op:0.12, gold:true  },
      { x:0.65, y:0.80, r:40, angle:0.2, speed:0.005,  op:0.14, gold:false },
      { x:0.92, y:0.35, r:35, angle:0.8, speed:0.006,  op:0.20, gold:true  },
      { x:0.55, y:0.15, r:28, angle:0.3, speed:0.007,  op:0.15, gold:false },
      { x:0.72, y:0.45, r:65, angle:1.0, speed:0.0025, op:0.10, gold:true  },
    ];

    const rings = [
      { x:0.78, y:0.50, r:140, width:1.5, speed:0.008,  angle:0,   op:0.18 },
      { x:0.78, y:0.50, r:200, width:1.0, speed:-0.005, angle:0.5, op:0.10 },
      { x:0.78, y:0.50, r:260, width:0.7, speed:0.003,  angle:1.0, op:0.07 },
    ];

    let t = 0;
    function draw() {
      animId = requestAnimationFrame(draw);
      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      const gx = width * 0.78, gy = height * 0.50;
      const dx = (mouse.x - gx) * 0.04, dy = (mouse.y - gy) * 0.04;
      const grad = ctx.createRadialGradient(gx+dx, gy+dy, 0, gx+dx, gy+dy, height * 0.45);
      grad.addColorStop(0,   'rgba(212,168,67,0.10)');
      grad.addColorStop(0.5, 'rgba(212,168,67,0.03)');
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      rings.forEach(ring => {
        ring.angle += ring.speed;
        ctx.save();
        ctx.translate(ring.x * width, ring.y * height);
        ctx.rotate(ring.angle);
        hexPath(ctx, 0, 0, ring.r, Math.PI / 6);
        ctx.strokeStyle = `rgba(212,168,67,${ring.op + Math.sin(t) * 0.04})`;
        ctx.lineWidth = ring.width;
        ctx.stroke();
        ctx.restore();
      });

      hexes.forEach((h, i) => {
        h.angle += h.speed;
        const pulse = Math.sin(t * 0.8 + i) * 0.04;
        ctx.save();
        ctx.translate(h.x * width, h.y * height);
        ctx.rotate(h.angle);
        hexPath(ctx, 0, 0, h.r, 0);
        ctx.strokeStyle = h.gold ? `rgba(212,168,67,${h.op+pulse})` : `rgba(80,90,160,${h.op+pulse})`;
        ctx.lineWidth = 1.5; ctx.stroke();
        hexPath(ctx, 0, 0, h.r * 0.65, 0);
        ctx.strokeStyle = h.gold ? `rgba(240,192,96,${h.op*0.6+pulse})` : `rgba(60,70,140,${h.op*0.6+pulse})`;
        ctx.lineWidth = 0.8; ctx.stroke();
        ctx.restore();
      });

      particles.forEach(p => {
        if (p.x < -5) p.x = width+5; if (p.x > width+5) p.x = -5;
        if (p.y < -5) p.y = height+5; if (p.y > height+5) p.y = -5;
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        const dist = Math.sqrt(mdx*mdx + mdy*mdy);
        if (dist < 160) { p.vx += mdx * 0.00003; p.vy += mdy * 0.00003; }
        p.vx *= 0.995; p.vy *= 0.995; p.x += p.vx; p.y += p.vy;
        const flicker = p.op * (0.85 + Math.sin(t * 1.5 + p.x) * 0.15);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.gold ? `${GOLD}${flicker})` : `${SUBTLE}${flicker})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 80) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,168,67,${(1 - d/80) * 0.12})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);
}

// ─────────────────────────────────────────────────────────────
// COUNTER HOOK
// ─────────────────────────────────────────────────────────────
function useCounter(target, suffix = '', duration = 1800, prefix = '') {
  const [val, setVal] = useState(`${prefix}0${suffix}`);
  const done = useRef(false);
  const ref  = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let v = 0;
        const step = target / (duration / 16);
        const id = setInterval(() => {
          v += step;
          if (v >= target) { v = target; clearInterval(id); }
          setVal(`${prefix}${Math.round(v).toLocaleString()}${suffix}`);
        }, 16);
      }
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, val };
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

  .th { font-family:'Inter',sans-serif; background:#0A0A0A; color:#fff; overflow-x:hidden; }
  .th *, .th *::before, .th *::after { box-sizing:border-box; }

  .th-canvas {
    position:absolute; inset:0; display:block;
    width:100% !important; height:100% !important;
    pointer-events:none; z-index:0; opacity:1;
  }

  /* ── HERO ─────────────────────────────────────────────────── */
  .th-hero {
    position:relative; height:100vh;
    min-height:640px; max-height:900px;
    display:flex; align-items:center;
    overflow:hidden; background:#0A0A0A;
  }

  /* hex1: left-side texture panel */
  .th-hex1-bg {
    position:absolute; inset:0; z-index:1; pointer-events:none;
    /* show mainly on left, fade to transparent rightward */
    background-image: var(--hex1-url);
    background-size: cover;
    background-position: left center;
    opacity: 0.18;
    mask-image: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, transparent 75%);
    -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, transparent 75%);
  }

  /* hex2: right-side texture panel — behind the laptop/bee */
  .th-hex2-bg {
    position:absolute; inset:0; z-index:1; pointer-events:none;
    background-image: var(--hex2-url);
    background-size: cover;
    background-position: right center;
    opacity: 0.22;
    mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 50%, transparent 80%);
    -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 50%, transparent 80%);
  }

  .th-hero-fade {
    position:absolute; inset:0; z-index:2; pointer-events:none;
    background:
      radial-gradient(ellipse 62% 90% at 36% 52%, transparent 0%, rgba(10,10,10,.55) 55%, rgba(10,10,10,.96) 100%),
      linear-gradient(180deg, rgba(10,10,10,.50) 0%, transparent 14%, transparent 80%, #0A0A0A 100%);
  }
  .th-hero-content { position:relative; z-index:10; }

  /* ── BEE ──────────────────────────────────────────────────── */
  /* Circular framed bee — no raw photo edge */
  .th-bee-wrap {
    position:absolute;
    bottom: 60px;
    right: -20px;
    z-index: 15;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(212,168,67,0.5);
    box-shadow:
      0 0 0 6px rgba(212,168,67,0.12),
      0 0 0 12px rgba(212,168,67,0.05),
      0 20px 60px rgba(212,168,67,0.45),
      0 8px 32px rgba(0,0,0,0.8);
    animation: th-bee-float 5s ease-in-out infinite;
    background: #0A0A0A;
  }
  .th-bee-wrap img {
    width: 130%;
    height: 130%;
    object-fit: cover;
    object-position: center 20%;
    transform: translateX(-12%);
  }

  /* ── ANIMATIONS ───────────────────────────────────────────── */
  @keyframes th-shimmer   { to { background-position:200% center; } }
  @keyframes th-bee-float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-16px) rotate(2deg)} }
  @keyframes th-laptop    { 0%,100%{transform:translateX(-54%) translateY(0)} 50%{transform:translateX(-54%) translateY(-13px)} }
  @keyframes th-coin      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(200deg)} }
  @keyframes th-ring      { 0%,100%{opacity:.55} 50%{opacity:1} }
  @keyframes th-ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes th-glow      { 0%,100%{opacity:.7} 50%{opacity:1} }

  .th-gold {
    background:linear-gradient(90deg,#D4A843,#FDD86A,#D4A843);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:th-shimmer 3s linear infinite;
  }
  .th-laptop { animation:th-laptop 7s ease-in-out infinite; filter:drop-shadow(0 28px 60px rgba(0,0,0,.88)) drop-shadow(0 0 40px rgba(212,168,67,.2)); }
  .th-coin   { animation:th-coin var(--cd,4s) ease-in-out infinite; animation-delay:var(--co,0s); border-radius:50%; position:absolute; background:radial-gradient(circle at 35% 30%,#FDD86A,#D4A843,#A07820); box-shadow:0 3px 16px rgba(212,168,67,.65); z-index:12; }
  .th-gring  { animation:th-ring 3s ease-in-out infinite; }
  .th-pglow  { animation:th-glow 4s ease-in-out infinite; }
  .th-ticker { display:flex; width:max-content; animation:th-ticker 26s linear infinite; }

  /* Scroll fade-up */
  .fu  { opacity:0; transform:translateY(22px); transition:opacity .55s ease, transform .55s ease; }
  .fu.in { opacity:1; transform:translateY(0); }
  .fu.d1{transition-delay:.08s} .fu.d2{transition-delay:.16s} .fu.d3{transition-delay:.24s}

  /* Hover states */
  .th-btn-p:hover  { opacity:.88!important; transform:translateY(-2px)!important; box-shadow:0 10px 32px rgba(212,168,67,.52)!important; }
  .th-btn-s:hover  { border-color:rgba(212,168,67,.55)!important; color:#D4A843!important; }
  .th-nav-a:hover  { color:#fff!important; }
  .th-step:hover   { border-color:rgba(212,168,67,.5)!important; transform:translateY(-4px)!important; }
  .th-cat:hover    { border-color:rgba(212,168,67,.55)!important; transform:translateY(-5px)!important; box-shadow:0 16px 40px rgba(0,0,0,.55)!important; }
  .th-stat:hover   { border-color:rgba(212,168,67,.4)!important; }
  .th-testi:hover  { border-color:rgba(212,168,67,.38)!important; transform:translateY(-4px)!important; }
  .th-pp:hover     { border-color:rgba(212,168,67,.5)!important; transform:translateY(-3px)!important; }
  .th-soc:hover    { border-color:#D4A843!important; color:#D4A843!important; }
  .th-flink:hover  { color:#D4A843!important; }
`;

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const canvasRef = useRef(null);
  const [navSolid, setNavSolid] = useState(false);

  const c1 = useCounter(15,  'K+', 1800);
  const c2 = useCounter(500, 'K+', 2000, '$');
  const c3 = useCounter(8,   'K+', 1600);

  useParticleCanvas(canvasRef);

  useEffect(() => {
    const fn = () => setNavSolid(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fu').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const G  = '#D4A843';
  const G2 = '#A07820';
  const BG = '#0A0A0A';
  const BG2= '#111111';
  const C  = '#181818';
  const C2 = '#1E1E1E';
  const M  = '#9CA3AF';
  const SB = '#2A2A2A';

  return (
    <>
      <style>{CSS}</style>
      <div className="th">

        {/* ══ NAV ════════════════════════════════════════════ */}
        <nav style={{
          position:'fixed', top:0, left:0, right:0, zIndex:500,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'13px 5%',
          background: navSolid ? 'rgba(10,10,10,.96)' : 'rgba(10,10,10,.72)',
          backdropFilter:'blur(18px)',
          borderBottom:'1px solid rgba(212,168,67,.13)',
          transition:'background .4s',
        }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
            <div style={{ width:32, height:32, background:`linear-gradient(135deg,${G},${G2})`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🐝</div>
            <span style={{ fontFamily:'"Syne",sans-serif', fontSize:20, fontWeight:900, color:'#fff' }}>TaskHive</span>
          </Link>

          <div style={{ display:'flex', gap:26, alignItems:'center' }}>
            {[['#','Home'],['#how','How It Works'],['#categories','Categories'],['#phone','Pricing'],['#testimonials','Testimonials'],['#','FAQ']].map(([h,l]) => (
              <a key={l} href={h} className="th-nav-a" style={{ color:M, textDecoration:'none', fontSize:13.5, fontWeight:500, transition:'color .2s' }}>{l}</a>
            ))}
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:18, cursor:'pointer' }}>🌙</span>
            {isAuthenticated ? (
              <Link to="/dashboard" style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'9px 22px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login"    style={{ border:'1px solid rgba(255,255,255,.18)', color:'#fff', padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:500, textDecoration:'none' }}>Login</Link>
                <Link to="/register" style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'9px 20px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 16px rgba(212,168,67,.35)' }}>Get Started</Link>
              </>
            )}
          </div>
        </nav>

        {/* ══ HERO ═══════════════════════════════════════════ */}
        <section
          className="th-hero"
          style={{ '--hex1-url': `url(${hex1})`, '--hex2-url': `url(${hex2})` }}
        >
          {/* Canvas — z:0 */}
          <canvas ref={canvasRef} className="th-canvas" />

          {/* hex1 — left texture, z:1 */}
          <div className="th-hex1-bg" />

          {/* hex2 — right texture, z:1 */}
          <div className="th-hex2-bg" />

          {/* Gradient fade — z:2 */}
          <div className="th-hero-fade" />

          {/* Content — z:10 */}
          <div className="th-hero-content" style={{ width:'100%', maxWidth:1280, margin:'0 auto', padding:'0 5%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center', height:'100%' }}>

            {/* ── LEFT ─────────────────────────────────────── */}
            <div style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(212,168,67,.12)', border:'1px solid rgba(212,168,67,.32)', borderRadius:20, padding:'5px 14px', fontSize:11, fontWeight:700, color:G, width:'fit-content', marginBottom:18, textTransform:'uppercase', letterSpacing:1 }}>
                🏆 #1 Trusted Earning Platform
              </div>

              <h1 style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(36px,4.5vw,64px)', fontWeight:900, lineHeight:1.06, letterSpacing:'-1.5px', marginBottom:14, color:'#fff' }}>
                Unlock Your<br />
                <span className="th-gold">Earning Potential</span>
              </h1>

              <p style={{ fontSize:15, color:M, lineHeight:1.65, marginBottom:26 }}>
                Complete tasks. Earn cash.<br />Work on your terms.
              </p>

              <div style={{ display:'flex', gap:12, marginBottom:34, flexWrap:'wrap' }}>
                <Link to="/register" className="th-btn-p" style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'13px 28px', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 6px 24px rgba(212,168,67,.4)', transition:'all .25s' }}>
                  Get Started Now →
                </Link>
                <a href="#how" className="th-btn-s" style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', padding:'13px 22px', borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, transition:'all .25s' }}>
                  Learn More →
                </a>
              </div>

              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  { r:c1.ref, v:c1.val, icon:'👥', label:'Active Users' },
                  { r:c2.ref, v:c2.val, icon:'💰', label:'Paid Out' },
                  { r:c3.ref, v:c3.val, icon:'✅', label:'Tasks Done' },
                ].map(s => (
                  <div key={s.label} ref={s.r} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, padding:'11px 14px', backdropFilter:'blur(10px)', flex:1, minWidth:100 }}>
                    <span style={{ fontSize:20 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontFamily:'"Syne",sans-serif', fontSize:17, fontWeight:900, color:G, lineHeight:1 }}>{s.v}</div>
                      <div style={{ fontSize:10, color:M, textTransform:'uppercase', letterSpacing:1, marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT ────────────────────────────────────── */}
            <div style={{ position:'relative', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {/* Glow ring under laptop */}
              <div className="th-gring" style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-54%)', width:360, height:44, background:'radial-gradient(ellipse,rgba(212,168,67,.48) 0%,transparent 70%)', filter:'blur(14px)', borderRadius:'50%', zIndex:6 }} />
              {/* Ambient glow */}
              <div className="th-pglow" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-52%)', width:460, height:460, background:'radial-gradient(circle,rgba(212,168,67,.15) 0%,transparent 65%)', zIndex:5, pointerEvents:'none' }} />

              {/* Coins */}
              {[
                { sz:32, style:{ top:'18%',    right:'8%'  }, cd:'3.5s', co:'0s'  },
                { sz:22, style:{ top:'30%',    left:'5%'   }, cd:'4.5s', co:'.6s' },
                { sz:28, style:{ bottom:'25%', left:'2%'   }, cd:'5s',   co:'.3s' },
                { sz:18, style:{ bottom:'30%', right:'5%'  }, cd:'3.8s', co:'1s'  },
                { sz:24, style:{ top:'55%',    right:'12%' }, cd:'4.2s', co:'.8s' },
              ].map((c, i) => (
                <div key={i} className="th-coin" style={{ width:c.sz, height:c.sz, '--cd':c.cd, '--co':c.co, ...c.style }} />
              ))}

              {/* Laptop */}
              <div className="th-laptop" style={{ position:'absolute', width:480, bottom:28, left:'50%', zIndex:8 }}>
                <img src={laptop} alt="Dashboard" style={{ width:'100%', display:'block' }} />
              </div>

              {/* ── BEE — circular framed portrait ─────────── */}
              <div className="th-bee-wrap">
                <img src={bee} alt="TaskHive Bee" />
              </div>
            </div>
          </div>
        </section>

        {/* ══ TICKER ═════════════════════════════════════════ */}
        <div style={{ overflow:'hidden', background:'rgba(212,168,67,.05)', borderTop:'1px solid rgba(212,168,67,.12)', borderBottom:'1px solid rgba(212,168,67,.12)', padding:'10px 0' }}>
          <div className="th-ticker">
            {[...TICKER,...TICKER].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'0 30px', fontSize:11, color:G, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', whiteSpace:'nowrap' }}>
                <span style={{ width:3, height:3, background:'rgba(212,168,67,.5)', borderRadius:'50%', display:'inline-block' }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ══ STATS ══════════════════════════════════════════ */}
        <section style={{ background:BG, borderBottom:'1px solid rgba(212,168,67,.1)', padding:'24px 5%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, maxWidth:880, margin:'0 auto' }}>
            {[{ icon:'👥', val:'15K+', lbl:'Active Users' },{ icon:'💸', val:'$500K+', lbl:'Paid Out' },{ icon:'✅', val:'8K+', lbl:'Tasks Completed' }].map((s, i) => (
              <div key={i} className={`th-stat fu d${i+1}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:14, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, transition:'border-color .2s' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(212,168,67,.1)', border:'1px solid rgba(212,168,67,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily:'"Syne",sans-serif', fontSize:20, fontWeight:900 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:M, marginTop:2 }}>{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════════ */}
        <section id="how" style={{ padding:'60px 5%', background:BG, borderTop:`1px solid ${SB}` }}>
          <h2 className="fu" style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(22px,3vw,32px)', fontWeight:900, textAlign:'center', marginBottom:36, letterSpacing:'-.5px' }}>
            How It Works
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, maxWidth:1080, margin:'0 auto', position:'relative' }}>
            <div style={{ position:'absolute', top:33, left:'13%', right:'13%', height:1, background:'linear-gradient(90deg,transparent,rgba(212,168,67,.35),rgba(212,168,67,.35),rgba(212,168,67,.35),transparent)', zIndex:0 }} />
            {[
              { n:1, icon:'🔍', title:'Browse Categories',  desc:'Explore a wide range of earning opportunities.' },
              { n:2, icon:'🛒', title:'Choose a Package',   desc:'Select the perfect plan that fits your goals.' },
              { n:3, icon:'💳', title:'Make Payment',       desc:'Secure payments via multiple trusted methods.' },
              { n:4, icon:'🚀', title:'Start Earning',      desc:'Get access to tasks and start earning instantly.' },
            ].map((s, i) => (
              <div key={i} className={`th-step fu d${Math.min(i+1,3)}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:16, padding:'20px 16px', textAlign:'center', position:'relative', zIndex:1, transition:'all .3s', cursor:'default' }}>
                <div style={{ position:'absolute', top:-10, right:13, width:22, height:22, borderRadius:'50%', background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{s.n}</div>
                <div style={{ width:56, height:56, margin:'0 auto 12px', background:'rgba(212,168,67,.08)', border:'1px solid rgba(212,168,67,.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{s.icon}</div>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:5 }}>{s.title}</div>
                <div style={{ fontSize:11.5, color:M, lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CATEGORIES ══════════════════════════════════════ */}
        <section id="categories" style={{ padding:'60px 5%', background:BG2, borderTop:`1px solid ${SB}` }}>
          <h2 className="fu" style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(22px,3vw,32px)', fontWeight:900, textAlign:'center', marginBottom:36, letterSpacing:'-.5px' }}>
            Popular Task <span style={{ color:G }}>Categories</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:10, maxWidth:1200, margin:'0 auto' }}>
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.slug} to={`/categories/${cat.slug}/packages`} style={{ textDecoration:'none' }}>
                <div className={`th-cat fu d${(i%4)+1}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:14, padding:'14px 8px', textAlign:'center', cursor:'pointer', transition:'all .3s' }}>
                  <span style={{ fontSize:26, marginBottom:7, display:'block' }}>{cat.emoji}</span>
                  <div style={{ fontSize:10.5, fontWeight:700, marginBottom:3, lineHeight:1.3, color:'#fff' }}>{cat.name}</div>
                  <div style={{ fontSize:9.5, color:G, fontWeight:600, marginBottom:7 }}>Earn {cat.earn}</div>
                  <button style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', border:'none', borderRadius:6, fontSize:10, fontWeight:700, padding:'5px 8px', cursor:'pointer', width:'100%', fontFamily:'"Inter",sans-serif' }}>Explore</button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ US PHONE ════════════════════════════════════════ */}
        <section id="phone" style={{ padding:'48px 5%', background:`linear-gradient(135deg,rgba(124,58,237,.13),rgba(10,10,10,.9),rgba(212,168,67,.07))`, borderTop:`1px solid ${SB}` }}>
          <div style={{ maxWidth:1080, margin:'0 auto', display:'grid', gridTemplateColumns:'240px 1fr', gap:36, alignItems:'center' }}>
            <div className="fu">
              <img src={laptop} alt="Phone" style={{ width:'100%', borderRadius:16, border:'2px solid rgba(212,168,67,.25)', filter:'drop-shadow(0 16px 32px rgba(212,168,67,.18))' }} />
              <div style={{ marginTop:12, background:'rgba(0,0,0,.5)', border:'1px solid rgba(212,168,67,.2)', borderRadius:12, padding:'11px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>📱</span>
                <div>
                  <div style={{ fontFamily:'"Syne",sans-serif', fontSize:14, fontWeight:700 }}>+1 (555) 123-4567</div>
                  <div style={{ fontSize:10.5, color:'#4ADE80', display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:5, height:5, background:'#4ADE80', borderRadius:'50%', display:'inline-block' }} /> Active
                  </div>
                </div>
              </div>
            </div>

            <div className="fu d1">
              <h2 style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(19px,2.4vw,27px)', fontWeight:900, marginBottom:8 }}>
                Get a US Phone Number<br /><span style={{ color:G }}>Monthly Subscriptions</span>
              </h2>
              <p style={{ fontSize:13, color:M, marginBottom:10, lineHeight:1.6 }}>For SMS verification, 2FA, and platform access.</p>
              <ul style={{ listStyle:'none', marginBottom:16 }}>
                {['For verification, SMS, and more.','Reliable. Private. Always active.'].map(t => (
                  <li key={t} style={{ fontSize:12, color:M, padding:'2px 0', display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ color:G }}>•</span>{t}
                  </li>
                ))}
              </ul>
              <button style={{ background:'linear-gradient(135deg,#7C3AED,#9333EA)', color:'#fff', border:'none', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(124,58,237,.4)', fontFamily:'"Inter",sans-serif', marginBottom:20 }}>
                View All Plans
              </button>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {[
                  { icon:'📦', name:'Basic',    price:'$15', nums:'1 Number',   best:false },
                  { icon:'⭐', name:'Standard', price:'$35', nums:'3 Numbers',  best:false },
                  { icon:'💎', name:'Premium',  price:'$70', nums:'10 Numbers', best:true  },
                ].map(p => (
                  <div key={p.name} className="th-pp" style={{ background: p.best ? 'rgba(212,168,67,.07)' : C, border:`1px solid ${p.best ? 'rgba(212,168,67,.45)' : SB}`, borderRadius:14, padding:'15px 13px', position:'relative', transition:'all .3s' }}>
                    {p.best && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:`linear-gradient(90deg,${G},${G2})`, color:'#0A0A0A', fontSize:9.5, fontWeight:800, padding:'3px 11px', borderRadius:20, whiteSpace:'nowrap' }}>Best Value</div>}
                    <div style={{ fontSize:12, fontWeight:700, marginBottom:4, display:'flex', alignItems:'center', gap:5 }}><span>{p.icon}</span>{p.name}</div>
                    <div style={{ fontFamily:'"Syne",sans-serif', fontSize:25, fontWeight:900 }}>{p.price}<span style={{ fontSize:12, color:M, fontWeight:400, fontFamily:'"Inter",sans-serif' }}>/mo</span></div>
                    <div style={{ fontSize:10.5, color:M, marginTop:3 }}>{p.nums}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ════════════════════════════════════ */}
        <section id="testimonials" style={{ padding:'60px 5%', background:BG, borderTop:`1px solid ${SB}` }}>
          <h2 className="fu" style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(22px,3vw,32px)', fontWeight:900, textAlign:'center', marginBottom:36, letterSpacing:'-.5px' }}>
            What Our Users <span style={{ color:G }}>Say</span>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, maxWidth:980, margin:'0 auto' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`th-testi fu d${i+1}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:16, padding:22, transition:'all .3s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:13 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', border:'2px solid rgba(212,168,67,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, background:'rgba(212,168,67,.08)', flexShrink:0 }}>{t.av}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13.5 }}>{t.name}</div>
                    <div style={{ color:G, fontSize:12, letterSpacing:1 }}>★★★★★</div>
                  </div>
                </div>
                <p style={{ fontSize:12.5, color:M, lineHeight:1.7, fontStyle:'italic' }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FOOTER ══════════════════════════════════════════ */}
        <footer style={{ background:BG2, borderTop:`1px solid ${SB}`, padding:'44px 5% 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr', gap:36, maxWidth:1200, margin:'0 auto 36px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
                <div style={{ width:28, height:28, background:`linear-gradient(135deg,${G},${G2})`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🐝</div>
                <span style={{ fontFamily:'"Syne",sans-serif', fontSize:17, fontWeight:900 }}>TaskHive</span>
              </div>
              <p style={{ fontSize:12.5, color:M, lineHeight:1.65, maxWidth:220 }}>Empowering people worldwide to earn online with trusted tasks and premium opportunities.</p>
            </div>
            {[
              { title:'Quick Links', links:[['#','Home'],['#how','How It Works'],['#categories','Categories'],['#','Pricing']] },
              { title:'Company',     links:[['#','About Us'],['#','Blog'],['#','Careers'],['#','Contact Us']] },
              { title:'Support',     links:[['#','FAQ'],['#','Terms of Service'],['#','Privacy Policy'],['#','Help Center']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:2, color:M, marginBottom:13 }}>{col.title}</h4>
                {col.links.map(([href, label]) => (
                  <a key={label} href={href} className="th-flink" style={{ display:'block', fontSize:13, color:M, textDecoration:'none', marginBottom:8, transition:'color .2s' }}>{label}</a>
                ))}
              </div>
            ))}
            <div>
              <h4 style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:2, color:M, marginBottom:13 }}>Follow Us</h4>
              <div style={{ display:'flex', gap:9, marginTop:10 }}>
                {['f','𝕏','📷','▶'].map(s => (
                  <a key={s} href="#" className="th-soc" style={{ width:34, height:34, borderRadius:9, background:C2, border:`1px solid ${SB}`, display:'flex', alignItems:'center', justifyContent:'center', color:M, fontSize:14, textDecoration:'none', transition:'all .2s' }}>{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${SB}`, paddingTop:17, textAlign:'center', fontSize:11.5, color:'#3A3A3A', maxWidth:1200, margin:'0 auto' }}>
            © 2024 TaskHive. All rights reserved.
          </div>
        </footer>

      </div>
    </>
  );
}