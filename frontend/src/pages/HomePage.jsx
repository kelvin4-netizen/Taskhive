// src/pages/HomePage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Menu, X } from 'lucide-react';

import bee    from '@/assets/bee.jpg';
import laptop from '@/assets/laptop.jpg';
import hex1   from '@/assets/hex1.jpg';
import hex2   from '@/assets/hex2.jpg';

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
  { av:'👩',   name:'Sarah M.',  text:'TaskHive changed the way I earn online. Tasks are legit and payments are always on time.' },
  { av:'👨',   name:'James K.',  text:"Great platform with real opportunities. I've earned more than I expected. Highly recommended!" },
  { av:'👩‍💼', name:'Emily R.',  text:'The US number subscription works perfectly for all my verification needs. Worth every penny.' },
];

// ── Particle canvas (desktop only) ────────────────────────────
function useParticleCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // skip on small screens
    if (window.innerWidth < 768) return;
    const ctx = canvas.getContext('2d');
    let width, height, animId;
    let mouse = { x: 0, y: 0 };
    function resize() {
      const p = canvas.parentElement;
      width = canvas.width  = p ? p.offsetWidth  : window.innerWidth;
      height= canvas.height = p ? p.offsetHeight : window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random()*1920, y: Math.random()*1080,
      r: Math.random()*1.4+0.3, vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2,
      gold: Math.random()>.72, op: Math.random()*.7+.2,
    }));
    let t = 0;
    function draw() {
      animId = requestAnimationFrame(draw); t += .012;
      ctx.clearRect(0,0,width,height);
      particles.forEach(p => {
        if(p.x<-5)p.x=width+5; if(p.x>width+5)p.x=-5;
        if(p.y<-5)p.y=height+5; if(p.y>height+5)p.y=-5;
        p.x+=p.vx; p.y+=p.vy;
        const fl = p.op*(.85+Math.sin(t*1.5+p.x)*.15);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = p.gold?`rgba(212,168,67,${fl})`:`rgba(50,55,90,${fl})`;
        ctx.fill();
      });
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize',resize); window.removeEventListener('mousemove',onMove); };
  }, []);
}

// ── Counter ────────────────────────────────────────────────────
function useCounter(target, suffix='', duration=1800, prefix='') {
  const [val, setVal] = useState(`${prefix}0${suffix}`);
  const done = useRef(false);
  const ref  = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let v = 0; const step = target/(duration/16);
        const id = setInterval(()=>{ v+=step; if(v>=target){v=target;clearInterval(id);} setVal(`${prefix}${Math.round(v).toLocaleString()}${suffix}`); },16);
      }
    },{ threshold:.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, val };
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

  .th { font-family:'Inter',sans-serif; background:#0A0A0A; color:#fff; overflow-x:hidden; }
  .th *, .th *::before, .th *::after { box-sizing:border-box; margin:0; padding:0; }

  /* scrollbar */
  .th ::-webkit-scrollbar { width:4px; }
  .th ::-webkit-scrollbar-track { background:transparent; }
  .th ::-webkit-scrollbar-thumb { background:rgba(212,168,67,.3); border-radius:2px; }

  /* canvas */
  .th-canvas { position:absolute; inset:0; width:100%!important; height:100%!important; pointer-events:none; z-index:0; }

  /* hero */
  .th-hero { position:relative; min-height:100svh; display:flex; align-items:center; overflow:hidden; background:#0A0A0A; padding-top:72px; }

  /* hex backgrounds */
  .th-hex1 { position:absolute; inset:0; z-index:1; pointer-events:none;
    background-image:var(--hex1-url); background-size:cover; background-position:left center; opacity:.15;
    mask-image:linear-gradient(to right,rgba(0,0,0,.9) 0%,rgba(0,0,0,.3) 50%,transparent 80%);
    -webkit-mask-image:linear-gradient(to right,rgba(0,0,0,.9) 0%,rgba(0,0,0,.3) 50%,transparent 80%); }
  .th-hex2 { position:absolute; inset:0; z-index:1; pointer-events:none;
    background-image:var(--hex2-url); background-size:cover; background-position:right center; opacity:.2;
    mask-image:linear-gradient(to left,rgba(0,0,0,.8) 0%,rgba(0,0,0,.3) 50%,transparent 80%);
    -webkit-mask-image:linear-gradient(to left,rgba(0,0,0,.8) 0%,rgba(0,0,0,.3) 50%,transparent 80%); }
  .th-fade { position:absolute; inset:0; z-index:2; pointer-events:none;
    background:radial-gradient(ellipse 60% 90% at 35% 52%,transparent 0%,rgba(10,10,10,.5) 55%,rgba(10,10,10,.97) 100%),
               linear-gradient(180deg,rgba(10,10,10,.5) 0%,transparent 12%,transparent 82%,#0A0A0A 100%); }

  /* bee */
  .th-bee { position:absolute; bottom:32px; right:16px; width:130px; height:130px; border-radius:50%; overflow:hidden;
    border:2px solid rgba(212,168,67,.45); box-shadow:0 0 0 5px rgba(212,168,67,.1),0 16px 40px rgba(212,168,67,.4);
    animation:th-bee-float 5s ease-in-out infinite; z-index:15; }
  .th-bee img { width:130%; height:130%; object-fit:cover; object-position:center 20%; transform:translateX(-12%); }

  @media(min-width:768px){
    .th-bee { width:180px; height:180px; right:-10px; bottom:48px; }
  }

  /* laptop */
  .th-laptop { animation:th-laptop 7s ease-in-out infinite; filter:drop-shadow(0 20px 50px rgba(0,0,0,.9)) drop-shadow(0 0 30px rgba(212,168,67,.18)); }

  /* gold text */
  .th-gold { background:linear-gradient(90deg,#D4A843,#FDD86A,#D4A843); background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:th-shimmer 3s linear infinite; }

  /* ticker */
  .th-ticker { display:flex; width:max-content; animation:th-ticker 26s linear infinite; }

  /* fade-up */
  .fu { opacity:0; transform:translateY(20px); transition:opacity .55s ease,transform .55s ease; }
  .fu.in { opacity:1; transform:translateY(0); }
  .fu.d1{transition-delay:.08s} .fu.d2{transition-delay:.16s} .fu.d3{transition-delay:.24s} .fu.d4{transition-delay:.32s}

  /* keyframes */
  @keyframes th-shimmer   { to{background-position:200% center} }
  @keyframes th-bee-float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
  @keyframes th-laptop    { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-12px)} }
  @keyframes th-ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes th-ring      { 0%,100%{opacity:.5} 50%{opacity:1} }

  /* nav mobile menu */
  .th-nav-mobile { display:none; position:fixed; inset:0; z-index:400; background:rgba(10,10,10,.98);
    flex-direction:column; align-items:center; justify-content:center; gap:28px; }
  .th-nav-mobile.open { display:flex; }

  /* hover states */
  .th-btn-p:hover  { opacity:.88!important; transform:translateY(-2px)!important; }
  .th-btn-s:hover  { border-color:rgba(212,168,67,.5)!important; color:#D4A843!important; }
  .th-cat:hover    { border-color:rgba(212,168,67,.5)!important; transform:translateY(-4px)!important; }
  .th-step:hover   { border-color:rgba(212,168,67,.45)!important; transform:translateY(-3px)!important; }
  .th-testi:hover  { border-color:rgba(212,168,67,.35)!important; transform:translateY(-3px)!important; }
  .th-pp:hover     { border-color:rgba(212,168,67,.45)!important; transform:translateY(-3px)!important; }
  .th-nav-a:hover  { color:#fff!important; }
  .th-flink:hover  { color:#D4A843!important; }
  .th-soc:hover    { border-color:#D4A843!important; color:#D4A843!important; }
`;

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const canvasRef = useRef(null);
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const c1 = useCounter(15,  'K+', 1800);
  const c2 = useCounter(500, 'K+', 2000, '$');
  const c3 = useCounter(8,   'K+', 1600);

  useParticleCanvas(canvasRef);

  useEffect(() => {
    const fn = () => setNavSolid(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); }), { threshold:.1 });
    document.querySelectorAll('.fu').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const G = '#D4A843', G2 = '#A07820';
  const BG = '#0A0A0A', BG2 = '#111111';
  const C = '#181818', C2 = '#1E1E1E';
  const M = '#9CA3AF', SB = '#2A2A2A';

  const NAV_LINKS = [['#','Home'],['#how','How It Works'],['#categories','Categories'],['#phone','Pricing'],['#testimonials','Testimonials']];

  return (
    <>
      <style>{CSS}</style>
      <div className="th">

        {/* ══ NAV ══════════════════════════════════════════════ */}
        <nav style={{
          position:'fixed', top:0, left:0, right:0, zIndex:500,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 5%',
          background: navSolid ? 'rgba(10,10,10,.97)' : 'rgba(10,10,10,.75)',
          backdropFilter:'blur(18px)',
          borderBottom:'1px solid rgba(212,168,67,.12)',
          transition:'background .4s',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
            <div style={{ width:30, height:30, background:`linear-gradient(135deg,${G},${G2})`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🐝</div>
            <span style={{ fontFamily:'"Syne",sans-serif', fontSize:19, fontWeight:900, color:'#fff' }}>TaskHive</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display:'flex', gap:24, alignItems:'center' }} className="hidden md:flex">
            {NAV_LINKS.map(([h,l]) => (
              <a key={l} href={h} className="th-nav-a" style={{ color:M, textDecoration:'none', fontSize:13, fontWeight:500, transition:'color .2s' }}>{l}</a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div style={{ display:'flex', gap:9, alignItems:'center' }} className="hidden md:flex">
            {isAuthenticated ? (
              <Link to="/dashboard" style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'9px 20px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login" style={{ border:'1px solid rgba(255,255,255,.18)', color:'#fff', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:500, textDecoration:'none' }}>Login</Link>
                <Link to="/register" style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:700, textDecoration:'none' }}>Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(true)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', padding:4, display:'flex' }} className="md:hidden">
            <Menu size={24} />
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`th-nav-mobile ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => setMenuOpen(false)} style={{ position:'absolute', top:18, right:22, background:'none', border:'none', color:'#fff', cursor:'pointer' }}>
            <X size={26} />
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:28, height:28, background:`linear-gradient(135deg,${G},${G2})`, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🐝</div>
            <span style={{ fontFamily:'"Syne",sans-serif', fontSize:18, fontWeight:900 }}>TaskHive</span>
          </div>
          {NAV_LINKS.map(([h,l]) => (
            <a key={l} href={h} onClick={() => setMenuOpen(false)} style={{ color:'#fff', textDecoration:'none', fontSize:18, fontWeight:600 }}>{l}</a>
          ))}
          <div style={{ display:'flex', flexDirection:'column', gap:10, width:'70%', marginTop:8 }}>
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'12px', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none', textAlign:'center' }}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ border:'1px solid rgba(255,255,255,.25)', color:'#fff', padding:'12px', borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none', textAlign:'center' }}>Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'12px', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none', textAlign:'center' }}>Get Started Free</Link>
              </>
            )}
          </div>
        </div>

        {/* ══ HERO ═════════════════════════════════════════════ */}
        <section className="th-hero" style={{ '--hex1-url':`url(${hex1})`, '--hex2-url':`url(${hex2})` }}>
          <canvas ref={canvasRef} className="th-canvas" />
          <div className="th-hex1" />
          <div className="th-hex2" />
          <div className="th-fade" />

          <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:1280, margin:'0 auto', padding:'40px 5% 80px' }}>
            {/* Mobile: stacked. Desktop: 2 columns */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:40 }} className="md:grid-cols-2">

              {/* LEFT — text */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(212,168,67,.12)', border:'1px solid rgba(212,168,67,.3)', borderRadius:20, padding:'5px 13px', fontSize:11, fontWeight:700, color:G, marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>
                  🏆 #1 Trusted Earning Platform
                </div>

                <h1 style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(34px,6vw,62px)', fontWeight:900, lineHeight:1.07, letterSpacing:'-1.5px', marginBottom:14, color:'#fff' }}>
                  Unlock Your<br />
                  <span className="th-gold">Earning Potential</span>
                </h1>

                <p style={{ fontSize:'clamp(13px,2vw,15px)', color:M, lineHeight:1.7, marginBottom:24, maxWidth:440 }}>
                  Complete tasks. Earn cash. Work on your terms — from anywhere in the world.
                </p>

                <div style={{ display:'flex', gap:10, marginBottom:32, flexWrap:'wrap' }}>
                  <Link to="/register" className="th-btn-p" style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', padding:'12px 24px', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none', boxShadow:'0 6px 22px rgba(212,168,67,.38)', transition:'all .25s' }}>
                    Get Started Free →
                  </Link>
                  <a href="#how" className="th-btn-s" style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:14, fontWeight:500, textDecoration:'none', transition:'all .25s' }}>
                    Learn More
                  </a>
                </div>

                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, width:'100%', maxWidth:420 }}>
                  {[
                    { r:c1.ref, v:c1.val, icon:'👥', label:'Users' },
                    { r:c2.ref, v:c2.val, icon:'💰', label:'Paid Out' },
                    { r:c3.ref, v:c3.val, icon:'✅', label:'Tasks' },
                  ].map(s => (
                    <div key={s.label} ref={s.r} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.09)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
                      <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
                      <div style={{ fontFamily:'"Syne",sans-serif', fontSize:15, fontWeight:900, color:G }}>{s.v}</div>
                      <div style={{ fontSize:9.5, color:M, textTransform:'uppercase', letterSpacing:1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — visual (hidden on small mobile, shown md+) */}
              <div style={{ position:'relative', height:360, display:'none' }} className="md:block">
                {/* Glow */}
                <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', width:320, height:36, background:'radial-gradient(ellipse,rgba(212,168,67,.45) 0%,transparent 70%)', filter:'blur(12px)', borderRadius:'50%', zIndex:5 }} />
                {/* Laptop */}
                <div className="th-laptop" style={{ position:'absolute', width:420, bottom:20, left:'50%', zIndex:8 }}>
                  <img src={laptop} alt="Dashboard" style={{ width:'100%', display:'block' }} />
                </div>
                {/* Bee */}
                <div className="th-bee" style={{ position:'absolute' }}>
                  <img src={bee} alt="Bee" />
                </div>
              </div>
            </div>
          </div>

          {/* Bee on mobile — shown below hero text */}
          <div className="th-bee md:hidden" style={{ bottom:20, right:12 }}>
            <img src={bee} alt="Bee" />
          </div>
        </section>

        {/* ══ TICKER ═══════════════════════════════════════════ */}
        <div style={{ overflow:'hidden', background:'rgba(212,168,67,.05)', borderTop:'1px solid rgba(212,168,67,.12)', borderBottom:'1px solid rgba(212,168,67,.12)', padding:'9px 0' }}>
          <div className="th-ticker">
            {[...TICKER,...TICKER].map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'0 24px', fontSize:10.5, color:G, fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', whiteSpace:'nowrap' }}>
                <span style={{ width:3, height:3, background:'rgba(212,168,67,.5)', borderRadius:'50%', display:'inline-block' }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ══ STATS ════════════════════════════════════════════ */}
        <section style={{ background:BG, borderBottom:`1px solid ${SB}`, padding:'20px 5%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, maxWidth:860, margin:'0 auto' }}>
            {[{ icon:'👥', val:'15K+', lbl:'Active Users' },{ icon:'💸', val:'$500K+', lbl:'Paid Out' },{ icon:'✅', val:'8K+', lbl:'Tasks Done' }].map((s,i) => (
              <div key={i} className={`fu d${i+1}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:12, padding:'14px 10px', display:'flex', alignItems:'center', gap:10, transition:'border-color .2s' }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'rgba(212,168,67,.1)', border:'1px solid rgba(212,168,67,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily:'"Syne",sans-serif', fontSize:17, fontWeight:900 }}>{s.val}</div>
                  <div style={{ fontSize:10, color:M, marginTop:1 }}>{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ═════════════════════════════════════ */}
        <section id="how" style={{ padding:'56px 5%', background:BG, borderTop:`1px solid ${SB}` }}>
          <h2 className="fu" style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(20px,3vw,30px)', fontWeight:900, textAlign:'center', marginBottom:32, letterSpacing:'-.5px' }}>
            How It Works
          </h2>
          {/* 2 cols on mobile, 4 on desktop */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, maxWidth:1060, margin:'0 auto' }} className="md:grid-cols-4">
            {[
              { n:1, icon:'🔍', title:'Browse Categories',  desc:'Explore a wide range of earning opportunities.' },
              { n:2, icon:'🛒', title:'Choose a Package',   desc:'Select the perfect plan for your goals.' },
              { n:3, icon:'💳', title:'Make Payment',       desc:'Secure payments via multiple methods.' },
              { n:4, icon:'🚀', title:'Start Earning',      desc:'Get access to tasks and earn instantly.' },
            ].map((s,i) => (
              <div key={i} className={`th-step fu d${Math.min(i+1,4)}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:14, padding:'18px 14px', textAlign:'center', position:'relative', transition:'all .3s' }}>
                <div style={{ position:'absolute', top:-10, right:12, width:20, height:20, borderRadius:'50%', background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{s.n}</div>
                <div style={{ width:50, height:50, margin:'0 auto 10px', background:'rgba(212,168,67,.08)', border:'1px solid rgba(212,168,67,.2)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
                <div style={{ fontWeight:700, fontSize:12.5, marginBottom:5 }}>{s.title}</div>
                <div style={{ fontSize:11, color:M, lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CATEGORIES ═══════════════════════════════════════ */}
        <section id="categories" style={{ padding:'56px 5%', background:BG2, borderTop:`1px solid ${SB}` }}>
          <h2 className="fu" style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(20px,3vw,30px)', fontWeight:900, textAlign:'center', marginBottom:28 }}>
            Popular <span style={{ color:G }}>Categories</span>
          </h2>
          {/* 2 cols mobile → 4 cols tablet → 8 cols desktop */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, maxWidth:1200, margin:'0 auto' }} className="sm:grid-cols-4 lg:grid-cols-8">
            {CATEGORIES.map((cat,i) => (
              <Link key={cat.slug} to={`/categories/${cat.slug}/packages`} style={{ textDecoration:'none' }}>
                <div className={`th-cat fu d${(i%4)+1}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:13, padding:'14px 8px', textAlign:'center', cursor:'pointer', transition:'all .3s', height:'100%' }}>
                  <span style={{ fontSize:24, marginBottom:6, display:'block' }}>{cat.emoji}</span>
                  <div style={{ fontSize:11, fontWeight:700, marginBottom:3, lineHeight:1.3, color:'#fff' }}>{cat.name}</div>
                  <div style={{ fontSize:10, color:G, fontWeight:600, marginBottom:8 }}>Earn {cat.earn}</div>
                  <button style={{ background:`linear-gradient(135deg,${G},${G2})`, color:'#0A0A0A', border:'none', borderRadius:6, fontSize:10, fontWeight:700, padding:'5px 8px', cursor:'pointer', width:'100%', fontFamily:'"Inter",sans-serif' }}>Explore</button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ US PHONE ═════════════════════════════════════════ */}
        <section id="phone" style={{ padding:'48px 5%', background:BG, borderTop:`1px solid ${SB}` }}>
          <div style={{ maxWidth:1060, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr', gap:28 }} className="md:grid-cols-phone">
            {/* Image — hidden on mobile, shown on md */}
            <div className="fu hidden md:block" style={{ maxWidth:220 }}>
              <img src={laptop} alt="Phone" style={{ width:'100%', borderRadius:14, border:'2px solid rgba(212,168,67,.22)' }} />
            </div>

            <div className="fu d1">
              <h2 style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(18px,2.5vw,26px)', fontWeight:900, marginBottom:8 }}>
                Get a US Phone Number<br /><span style={{ color:G }}>Monthly Subscriptions</span>
              </h2>
              <p style={{ fontSize:13, color:M, marginBottom:16, lineHeight:1.6 }}>For SMS verification, 2FA, and platform access. Reliable, private, always active.</p>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
                {[
                  { icon:'📦', name:'Basic',    price:'$15', nums:'1 Number',   best:false },
                  { icon:'⭐', name:'Standard', price:'$35', nums:'3 Numbers',  best:false },
                  { icon:'💎', name:'Premium',  price:'$70', nums:'10 Numbers', best:true  },
                ].map(p => (
                  <div key={p.name} className="th-pp" style={{ background: p.best?'rgba(212,168,67,.07)':C, border:`1px solid ${p.best?'rgba(212,168,67,.4)':SB}`, borderRadius:13, padding:'14px 10px', position:'relative', transition:'all .3s' }}>
                    {p.best && <div style={{ position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)', background:`linear-gradient(90deg,${G},${G2})`, color:'#0A0A0A', fontSize:9, fontWeight:800, padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>Best Value</div>}
                    <div style={{ fontSize:11.5, fontWeight:700, marginBottom:4 }}>{p.icon} {p.name}</div>
                    <div style={{ fontFamily:'"Syne",sans-serif', fontSize:22, fontWeight:900 }}>{p.price}<span style={{ fontSize:11, color:M, fontWeight:400, fontFamily:'"Inter",sans-serif' }}>/mo</span></div>
                    <div style={{ fontSize:10, color:M, marginTop:2 }}>{p.nums}</div>
                  </div>
                ))}
              </div>

              <Link to="/dashboard/phones" style={{ background:'linear-gradient(135deg,#7C3AED,#9333EA)', color:'#fff', border:'none', borderRadius:10, padding:'11px 22px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'"Inter",sans-serif', textDecoration:'none', display:'inline-block' }}>
                View All Plans →
              </Link>
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ═════════════════════════════════════ */}
        <section id="testimonials" style={{ padding:'56px 5%', background:BG2, borderTop:`1px solid ${SB}` }}>
          <h2 className="fu" style={{ fontFamily:'"Syne",sans-serif', fontSize:'clamp(20px,3vw,30px)', fontWeight:900, textAlign:'center', marginBottom:28 }}>
            What Our Users <span style={{ color:G }}>Say</span>
          </h2>
          {/* 1 col mobile → 3 cols desktop */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14, maxWidth:960, margin:'0 auto' }} className="md:grid-cols-3">
            {TESTIMONIALS.map((t,i) => (
              <div key={t.name} className={`th-testi fu d${i+1}`} style={{ background:C, border:`1px solid ${SB}`, borderRadius:14, padding:20, transition:'all .3s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid rgba(212,168,67,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, background:'rgba(212,168,67,.08)', flexShrink:0 }}>{t.av}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{t.name}</div>
                    <div style={{ color:G, fontSize:11, letterSpacing:1 }}>★★★★★</div>
                  </div>
                </div>
                <p style={{ fontSize:12.5, color:M, lineHeight:1.7, fontStyle:'italic' }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FOOTER ═══════════════════════════════════════════ */}
        <footer style={{ background:BG2, borderTop:`1px solid ${SB}`, padding:'40px 5% 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:28, maxWidth:1200, margin:'0 auto 28px' }} className="sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div style={{ gridColumn:'1/-1' }} className="lg:col-span-1 lg:col-auto">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:26, height:26, background:`linear-gradient(135deg,${G},${G2})`, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🐝</div>
                <span style={{ fontFamily:'"Syne",sans-serif', fontSize:16, fontWeight:900 }}>TaskHive</span>
              </div>
              <p style={{ fontSize:12, color:M, lineHeight:1.7, maxWidth:200 }}>Empowering people worldwide to earn online with trusted tasks.</p>
            </div>
            {[
              { title:'Quick Links', links:[['#','Home'],['#how','How It Works'],['#categories','Categories'],['#phone','Pricing']] },
              { title:'Company',     links:[['#','About Us'],['#','Blog'],['#','Careers'],['#','Contact']] },
              { title:'Support',     links:[['#','FAQ'],['#','Terms'],['#','Privacy'],['#','Help Center']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, color:M, marginBottom:12 }}>{col.title}</h4>
                {col.links.map(([href,label]) => (
                  <a key={label} href={href} className="th-flink" style={{ display:'block', fontSize:12.5, color:M, textDecoration:'none', marginBottom:7, transition:'color .2s' }}>{label}</a>
                ))}
              </div>
            ))}
            {/* Social */}
            <div>
              <h4 style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:2, color:M, marginBottom:12 }}>Follow Us</h4>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['f','𝕏','📷','▶'].map(s => (
                  <a key={s} href="#" className="th-soc" style={{ width:32, height:32, borderRadius:8, background:C2, border:`1px solid ${SB}`, display:'flex', alignItems:'center', justifyContent:'center', color:M, fontSize:13, textDecoration:'none', transition:'all .2s' }}>{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${SB}`, paddingTop:16, textAlign:'center', fontSize:11, color:'#3A3A3A', maxWidth:1200, margin:'0 auto' }}>
            © 2024 TaskHive. All rights reserved.
          </div>
        </footer>

      </div>
    </>
  );
}