import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Hls from 'hls.js'; // npm i hls.js
import { videos } from './videos.js';
import { UPI_ID, PAYEE_NAME, PRICE, DAYS, FACEBOOK, PAYEE_KEYWORDS, SITE_NAME } from './config.js';
import * as C from './config.js';
import { analyze } from './verify.js';
const QR_IMAGE = C.QR_IMAGE || '/photo/qr.jpeg';
const HERO_IMAGE = C.HERO_IMAGE || '';

const KEY = 'cf_sub_end';
const getEnd = () => Number(localStorage.getItem(KEY)) || 0;

export default function App() {
  const [end, setEnd] = useState(getEnd()), [now, setNow] = useState(Date.now());
  const [sel, setSel] = useState(null), [pay, setPay] = useState(false), [playing, setPlaying] = useState(false), [q, setQ] = useState('');
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const active = end > now;
  const list = videos.filter((v) => (v.title + v.category).toLowerCase().includes(q.toLowerCase()));
  const cats = [...new Set(list.map((v) => v.category))];
  const hero = videos.find((v) => v.featured) || videos[0];
  const open = (v) => { setSel(v); setPlaying(false); };
  const play = () => (active ? setPlaying(true) : setPay(true));
  const paid = (utr) => { localStorage.setItem('cf_used', JSON.stringify([...JSON.parse(localStorage.getItem('cf_used') || '[]'), utr])); const e = Date.now() + DAYS * 864e5; localStorage.setItem(KEY, e); setEnd(e); setNow(Date.now()); setPay(false); setPlaying(true); };

  return (
    <div className="min-h-screen">
      <nav className="glass fixed left-1/2 top-3 z-20 flex w-[94%] max-w-6xl -translate-x-1/2 items-center justify-between gap-3 rounded-full px-5 py-2.5">
        <a href="#top" className="flex items-center gap-2 text-xl font-extrabold tracking-tight"><img src="/photo/logo.png" alt="" className="h-9 w-9 rounded-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />{SITE_NAME.split(' ')[0]} <span className="-ml-1 text-accent">{SITE_NAME.split(' ').slice(1).join(' ')}</span></a>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-24 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm outline-none placeholder:text-white/40 focus:border-accent md:w-52" />
          {FACEBOOK && <a href="#contact" className="hidden rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white sm:block">Contact</a>}
          <button onClick={() => !active && setPay(true)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${active ? 'glass-red' : 'btn-red'}`}>{active ? `Active · ${new Date(end).toLocaleDateString()}` : `Subscribe ₹${PRICE}`}</button>
        </div>
      </nav>

      <div id="top" className="px-3 pt-20 md:px-8">
        {!q && <motion.header onClick={HERO_IMAGE ? undefined : () => open(hero)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative mx-auto aspect-video w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 ${HERO_IMAGE ? '' : 'max-h-[70vh] cursor-pointer'}`}>
          {HERO_IMAGE ? <img src={HERO_IMAGE} alt={SITE_NAME} className="h-full w-full object-cover" /> : <>
            <Thumb v={hero} live className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/40 to-accent/10" /></>}
        </motion.header>}

        <main className={`mx-auto max-w-6xl space-y-8 py-10 ${q ? 'pt-4' : ''}`}>
          {!cats.length && <p className="text-white/50">Kuch nahi mila.</p>}
          {cats.map((c) => (
            <section key={c}><h2 className="mb-3 text-xl font-bold">{c}</h2>
              <div className="no-scrollbar grid grid-cols-1 gap-4 px-1 py-4 sm:flex sm:overflow-x-auto">
                {list.filter((v) => v.category === c).map((v) => (
                  <button key={v.id} onClick={() => open(v)} className="card glass relative w-full flex-none overflow-hidden rounded-2xl text-left sm:w-48 md:w-64">
                    <Thumb v={v} hoverPlay className="aspect-video w-full object-cover" />
                    <div className="p-3"><p className="truncate text-sm font-semibold">{v.title}</p><p className="text-xs text-white/50">{v.mins} min</p></div>
                    {!active && <span className="glass absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs">🔒</span>}
                  </button>))}
              </div></section>))}
        </main>

        <section id="contact" className="mx-auto mb-12 max-w-6xl">
          {FACEBOOK && <div className="glass rounded-3xl p-6 text-center md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Contact</p>
            <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">Payment ya video me <span className="text-accent">problem?</span></h2>
            <p className="mx-auto mt-2 max-w-md text-white/60">Seedha message karo, jaldi reply milega.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={FACEBOOK} target="_blank" rel="noreferrer" className="btn-red rounded-full px-7 py-3 font-bold">Facebook</a>
            </div>
          </div>}
          <p className="mt-6 text-center text-xs text-white/40">© {new Date().getFullYear()} {SITE_NAME}</p>
        </section>
      </div>

      <AnimatePresence>
        {sel && <Modal key="v" onClose={() => setSel(null)} wide>
          <div className="aspect-video w-full bg-black">
            {playing && active ? <Player key={sel.id} v={sel} />
              : <div className="relative h-full w-full"><Thumb v={sel} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] to-transparent" />
                <button onClick={play} className="btn-red absolute bottom-4 left-4 rounded-full px-7 py-2.5 font-bold md:left-8">▶ Play</button></div>}
          </div>
          <div className="p-5 md:p-8"><h2 className="text-2xl font-bold md:text-3xl">{sel.title}</h2>
            <p className="mt-1 text-sm text-white/50"><span className="text-red-300">{sel.year}</span> · {sel.mins} min · {sel.category}</p>
            <p className="mt-3 text-white/80">{sel.desc}</p></div>
        </Modal>}
        {pay && <Modal key="p" onClose={() => setPay(false)}><PayBox onDone={paid} /></Modal>}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, wide }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }} onClick={(e) => e.stopPropagation()}
      className={`glass relative max-h-[94vh] w-full overflow-y-auto rounded-3xl ${wide ? 'max-w-3xl' : 'max-w-md'}`}>
      <button onClick={onClose} className="glass absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full hover:bg-white/20">✕</button>{children}</motion.div></motion.div>;
}

async function prep(file) { // OCR ke liye: safed background, sahi size, grayscale; dark-mode screenshot ko ulta karke
  try {
    const b = await createImageBitmap(file), k = b.width > 1600 ? 1600 / b.width : b.width < 1000 ? 1000 / b.width : 1, c = document.createElement('canvas');
    c.width = Math.round(b.width * k); c.height = Math.round(b.height * k);
    const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(b, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data; let sum = 0, cnt = 0;
    for (let i = 0; i < p.length; i += 388) { sum += 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]; cnt++; }
    const dark = sum / cnt < 110;
    for (let i = 0; i < p.length; i += 4) { const g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]; p[i] = p[i + 1] = p[i + 2] = dark ? 255 - g : g; }
    x.putImageData(d, 0, 0); return c;
  } catch { return file; }
}
function PayBox({ onDone }) {
  const [file, setFile] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [utr, setUtr] = useState(''), [noQr, setNoQr] = useState(false);
  const [seen, setSeen] = useState('');
  const accept = (f, key) => {
    if (JSON.parse(localStorage.getItem('cf_used') || '[]').includes(key)) return setErr('Ye transaction ID pehle use ho chuki hai.');
    setUtr(key); setFile(f); setErr('');
  };
  const pick = async (e) => {
    const f = e.target.files[0]; setErr(''); setFile(null); setUtr(''); setSeen(''); if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return setErr('Sirf image (PNG/JPG) upload karo');
    if (f.size > 10e6) return setErr('Image 10 MB se chhoti honi chahiye');
    setBusy(true);
    try {
      const T = await import('tesseract.js'), createWorker = T.createWorker || T.default.createWorker;
      const img = await prep(f), w = await createWorker('eng');
      let words = '', digits = '';
      try { // pass 1: poora text, pass 2: sirf numbers (zyada pakka)
        words = (await w.recognize(img)).data.text || '';
        await w.setParameters({ tessedit_pageseg_mode: '11', tessedit_char_whitelist: '0123456789 .' });
        digits = (await w.recognize(img)).data.text || '';
      } finally { await w.terminate(); }
      const r = analyze(words, digits, PRICE, PAYEE_KEYWORDS, Number(C.MAX_AGE_DAYS) || 0, new Date(), UPI_ID);
      setSeen(words.replace(/\s+/g, ' ').slice(0, 140));
      const marks = `Receiver UPI ID: ${r.upiOk ? '✓' : '✗'}, ₹${PRICE}: ${r.amount ? '✓' : '✗'}, Paid Successfully: ${r.ok ? '✓' : '✗'}`;
      if (r.wrongAmount) setErr(`Screenshot me ₹${r.wrongAmount} dikh raha hai, ₹${PRICE} ka payment chahiye.`);
      else if (r.stale) setErr('Ye purana screenshot lag raha hai. Abhi ke payment ka screenshot daalo.');
      else if (r.upiOk && r.amount && r.ok && r.payee) accept(f, r.id || `f${f.size}${f.lastModified}`);
      else setErr(`Screenshot verify nahi hua (${marks}). Aisa saaf screenshot daalo jisme receiver ki UPI ID, ₹${PRICE} aur Paid Successfully teeno dikhein.`);
    } catch { setErr('Screenshot check nahi ho paya. Internet check karke dobara try karo.'); }
    setBusy(false);
  };
  return <div className="p-6">
    <h2 className="pr-10 text-2xl font-extrabold">₹{PRICE} pay karo, <span className="text-accent">{DAYS} din</span> video dekho</h2>
    <p className="mt-5 text-sm font-semibold text-white/70">Step 1 — QR scan karke ₹{PRICE} bhejo</p>
    <div className="mt-3 flex flex-col items-center gap-2">
      {noQr ? <p className="rounded-xl bg-red-900/40 p-3 text-sm text-red-200">QR file nahi mili. Isko public/photo/qr.jpeg me rakho (naam chhote akshar me).</p>
        : <img src={QR_IMAGE} alt="Payment QR" onError={() => setNoQr(true)} className="h-64 w-64 rounded-2xl object-contain" />}
      <div className="flex items-center gap-2"><PayIcon name="Google Pay" /><PayIcon name="PhonePe" /><PayIcon name="Paytm" /></div>
      <p className="text-center text-xs text-white/60">Computer par ho to phone se scan karo. Phone par ho to <a href={QR_IMAGE} download="payment-qr.jpeg" className="text-accent underline">QR save karo</a>, phir UPI app me scanner ke andar gallery wala icon dabao.</p>
    </div>
    <p className="mt-5 text-sm font-semibold text-white/70">Step 2 — Payment ka screenshot upload karo</p>
    <input type="file" accept="image/*" onChange={pick} className="glass mt-2 block w-full rounded-xl p-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:font-semibold file:text-white" />
    <p className="mt-1 text-xs text-white/40">Screenshot me teen cheezein dikhni chahiye: receiver ki UPI ID, ₹{PRICE} aur "Paid Successfully".</p>
    {busy && <p className="mt-2 text-sm text-white/70">⏳ Screenshot check ho raha hai… (pehli baar 10-20 second lag sakte hain)</p>}
    {file && !busy && <p className="mt-2 text-sm text-green-400">✓ Payment screenshot sahi lag raha hai</p>}
    {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
    {err && seen && <p className="mt-2 text-[11px] text-white/30">Screenshot se padha: {seen}</p>}
    <button disabled={!file || busy} onClick={() => onDone(utr)} className="btn-red mt-5 w-full rounded-full py-3 font-bold">Submit</button>
  </div>;
}

// Simplified app marks. Official logo use karna ho to PNG/SVG ko src/assets me daalo aur yahan <img> lagao.
function PayIcon({ name }) {
  const box = 'grid h-9 w-9 flex-none place-items-center rounded-full bg-white';
  if (name === 'Google Pay') return <span className={box}><svg viewBox="0 0 40 40" className="h-7 w-7"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset=".25" stopColor="#EA4335"/><stop offset=".25" stopColor="#FBBC05"/><stop offset=".5" stopColor="#FBBC05"/><stop offset=".5" stopColor="#34A853"/><stop offset=".75" stopColor="#34A853"/><stop offset=".75" stopColor="#4285F4"/></linearGradient></defs><text x="20" y="30" textAnchor="middle" fontSize="30" fontWeight="800" fontFamily="Arial" fill="url(#g)">G</text></svg></span>;
  if (name === 'PhonePe') return <span className={box + ' !bg-[#5f259f]'}><svg viewBox="0 0 40 40" className="h-7 w-7"><text x="20" y="27" textAnchor="middle" fontSize="19" fontWeight="800" fontFamily="Arial" fill="#fff">Pe</text></svg></span>;
  if (name === 'Paytm') return <span className={box}><svg viewBox="0 0 40 40" className="h-7 w-7"><text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Arial"><tspan fill="#002970">pay</tspan><tspan fill="#00baf2">tm</tspan></text></svg></span>;
  return <span className={box}><svg viewBox="0 0 40 40" className="h-7 w-7"><text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="Arial" fill="#097939">UPI</text><path d="M12 29h16l-3-3m3 3l-3 3" stroke="#e97626" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg></span>;
}

const ytId = (u) => (u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/) || [])[1];
const embedUrl = (u) => {
  const y = ytId(u); if (y) return `https://www.youtube.com/embed/${y}?rel=0`;
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/); if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  const d = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/); if (d) return `https://drive.google.com/file/d/${d[1]}/preview`;
  return null;
};

// YouTube / Vimeo / Google Drive link -> embed (iframe). .m3u8 (HLS) -> hls.js. Baaki (mp4, webm, ogg, mov...) -> normal player.
const isHls = (u) => /\.m3u8(?:$|\?)/i.test(u);
const fixUrl = (u) => u.replace(/(dropbox\.com.*)dl=0/, '$1raw=1');

function Player({ v }) {
  const [err, setErr] = useState(false);
  const ref = useRef(null);
  const emb = v.embed || embedUrl(v.url);
  const hls = isHls(v.url);

  useEffect(() => {
    const el = ref.current;
    if (!el || emb) return;
    el.muted = false; // sound ON
    el.volume = 1;
    if (hls) {
      if (el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = v.url; // Safari native HLS
      } else if (Hls.isSupported()) {
        const h = new Hls();
        h.loadSource(v.url);
        h.attachMedia(el);
        return () => h.destroy();
      } else setErr(true);
    }
  }, [v.url, emb, hls]);

  if (err) return <p className="p-4 text-white">Video load nahi ho pa raha.</p>;

  if (emb) {
    return (
      <iframe
        src={emb}
        title={v.title}
        className="h-full w-full"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div className="h-full w-full bg-black">
      <video
        ref={ref}
        src={hls ? undefined : fixUrl(v.url)}
        controls
        playsInline
        preload="metadata"
        referrerPolicy="no-referrer"
        className="h-full w-full object-contain"
        onError={() => setErr(true)}
      />
    </div>
  );
}

// Thumbnail hamesha video se: direct video = uska frame; YouTube/Drive = unka apna thumbnail.
function Thumb({ v, className, live, hoverPlay }) {
  const y = ytId(v.url), d = v.url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (y) return <img src={`https://img.youtube.com/vi/${y}/hqdefault.jpg`} alt={v.title} loading="lazy" className={className} />;
  if (d) return <img src={`https://drive.google.com/thumbnail?id=${d[1]}&sz=w800`} alt={v.title} loading="lazy" className={className} />;
  if (v.embed || embedUrl(v.url) || isHls(v.url)) return <div className={className + ' bg-white/10'} />;
  const src = fixUrl(v.url);
  return <video src={live ? src : `${src}#t=0.1`} preload={live ? 'auto' : 'metadata'} autoPlay={live} muted loop playsInline
    onMouseEnter={hoverPlay ? (e) => e.currentTarget.play().catch(() => {}) : undefined}
    onMouseLeave={hoverPlay ? (e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.1; } : undefined}
    className={className + ' bg-white/10'} />;
}