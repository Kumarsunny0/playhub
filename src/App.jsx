import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { videos } from './videos.js';
import { UPI_ID, PAYEE_NAME, PRICE, DAYS, PAYEE_KEYWORDS } from './config.js';

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
        <a href="#top" className="text-xl font-extrabold tracking-tight">Comedy<span className="text-accent">Flix</span></a>
        <div className="flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-24 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm outline-none placeholder:text-white/40 focus:border-accent md:w-52" />
          <a href="#contact" className="hidden rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white sm:block">Contact</a>
          <button onClick={() => !active && setPay(true)} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${active ? 'glass-red' : 'btn-red'}`}>{active ? `Active · ${new Date(end).toLocaleDateString()}` : `Subscribe ₹${PRICE}`}</button>
        </div>
      </nav>

      <div id="top" className="px-3 pt-20 md:px-8">
        {!q && <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto h-[62vh] min-h-[400px] max-w-6xl overflow-hidden rounded-3xl border border-white/10">
          <Thumb v={hero} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/40 to-accent/10" />
          <div className="glass absolute bottom-4 left-4 right-4 max-w-xl rounded-2xl p-5 md:bottom-8 md:left-8 md:p-7">
            <span className="rounded-full bg-accent/25 px-3 py-1 text-xs font-semibold text-red-300">Featured</span>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">{hero.title}</h1>
            <p className="mt-2 text-sm text-white/75 md:text-base">{hero.desc}</p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { open(hero); play(); }} className="btn-red rounded-full px-6 py-2.5 font-bold">▶ Play</button>
              <button onClick={() => open(hero)} className="glass rounded-full px-6 py-2.5 font-semibold hover:bg-white/10">More info</button>
            </div>
          </div>
        </motion.header>}

        <main className={`mx-auto max-w-6xl space-y-8 py-10 ${q ? 'pt-4' : ''}`}>
          {!cats.length && <p className="text-white/50">Kuch nahi mila.</p>}
          {cats.map((c) => (
            <section key={c}><h2 className="mb-3 text-xl font-bold">{c}</h2>
              <div className="no-scrollbar flex gap-4 overflow-x-auto px-1 py-4">
                {list.filter((v) => v.category === c).map((v) => (
                  <button key={v.id} onClick={() => open(v)} className="card glass relative w-48 flex-none overflow-hidden rounded-2xl text-left md:w-64">
                    <Thumb v={v} className="aspect-video w-full object-cover" />
                    <div className="p-3"><p className="truncate text-sm font-semibold">{v.title}</p><p className="text-xs text-white/50">{v.mins} min</p></div>
                    {!active && <span className="glass absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs">🔒</span>}
                  </button>))}
              </div></section>))}
        </main>

       
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

function PayBox({ onDone }) {
  const [file, setFile] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [utr, setUtr] = useState('');
  const q = `pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${PRICE}&cu=INR&tn=${encodeURIComponent('ComedyFlix 1 month')}`;
  const apps = [['Google Pay', `tez://upi/pay?${q}`], ['PhonePe', `phonepe://pay?${q}`], ['Paytm', `paytmmp://pay?${q}`], ['Other UPI', `upi://pay?${q}`]];
  // Screenshot ka text padhke check: amount, success word, 12-digit transaction ID, (optional) payee naam, aur ID pehle use na hui ho.
  const pick = async (e) => {
    const f = e.target.files[0]; setErr(''); setFile(null); setUtr(''); if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return setErr('Sirf image (PNG/JPG) upload karo');
    if (f.size > 5e6) return setErr('Image 5 MB se chhoti honi chahiye');
    setBusy(true);
    try {
      const { default: Tesseract } = await import('tesseract.js');
      const t = (await Tesseract.recognize(f, 'eng')).data.text || '';
      const id = (t.match(/\b\d{12}\b/) || [])[0];
      const miss = [];
      if (!new RegExp(`\\b${PRICE}(\\.00)?\\b`).test(t)) miss.push(`₹${PRICE} amount`);
      if (!/success|paid|completed|sent|received/i.test(t)) miss.push('"Successful" status');
      if (!id) miss.push('12-digit transaction ID');
      if (PAYEE_KEYWORDS.length && !PAYEE_KEYWORDS.some((k) => t.toLowerCase().includes(k.toLowerCase()))) miss.push('payee ka naam');
      if (miss.length) setErr(`Ye payment screenshot nahi lag raha. Poora, saaf screenshot daalo jisme dikhe: ${miss.join(', ')}.`);
      else if (JSON.parse(localStorage.getItem('cf_used') || '[]').includes(id)) setErr('Ye transaction ID pehle use ho chuki hai.');
      else { setUtr(id); setFile(f); }
    } catch { setErr('Screenshot check nahi ho paya. Internet check karke dobara try karo.'); }
    setBusy(false);
  };
  return <div className="p-6">
    <h2 className="pr-10 text-2xl font-extrabold">₹{PRICE} pay karo, <span className="text-accent">{DAYS} din</span> video dekho</h2>
    <p className="mt-5 text-sm font-semibold text-white/70">Step 1 — Payment karo</p>
    <div className="mt-2 grid grid-cols-2 gap-2">{apps.map(([n, h]) => <a key={n} href={h} className="glass flex items-center gap-2 rounded-full py-2 pl-2 pr-3 text-sm font-semibold hover:bg-accent/30"><PayIcon name={n} />{n}</a>)}</div>
    <p className="mt-2 text-xs text-white/50">Payment phone par UPI app se karo (buttons phone par chalte hain).</p>
    <p className="mt-5 text-sm font-semibold text-white/70">Step 2 — Payment ka screenshot upload karo</p>
    <input type="file" accept="image/*" onChange={pick} className="glass mt-2 block w-full rounded-xl p-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:font-semibold file:text-white" />
    {busy && <p className="mt-2 text-sm text-white/70">⏳ Screenshot check ho raha hai… (pehli baar thoda time lagta hai)</p>}
    {file && !busy && <p className="mt-2 text-sm text-green-400">✓ Payment screenshot sahi lag raha hai</p>}
    {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
    <button disabled={!file || busy} onClick={() => onDone(utr)} className="btn-blue mt-5 w-full rounded-full py-3 font-bold">Submit</button>
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
  const y = ytId(u); if (y) return `https://www.youtube.com/embed/${y}?autoplay=1&rel=0`;
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/); if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  const d = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/); if (d) return `https://drive.google.com/file/d/${d[1]}/preview`;
  return null;
};
const isHls = (u) => /\.m3u8(\?|$)/i.test(u);

// YouTube / Vimeo / Google Drive link -> embed. .m3u8 (HLS) -> hls.js. Baaki (mp4, webm, ogg, mov...) -> normal player.
function Player({ v }) {
  const ref = useRef(null), [err, setErr] = useState(false);
  const emb = embedUrl(v.url) || (v.embed ? v.url : null), hls = isHls(v.url);
  const src = v.url.replace(/(dropbox\.com.*)dl=0/, '$1raw=1');
  useEffect(() => {
    const el = ref.current; if (!hls || !el) return;
    if (el.canPlayType('application/vnd.apple.mpegurl')) { el.src = v.url; return; }
    let h; import('hls.js').then(({ default: Hls }) => { if (!Hls.isSupported()) return setErr(true); h = new Hls(); h.loadSource(v.url); h.attachMedia(el); h.on(Hls.Events.ERROR, (_, d) => d.fatal && setErr(true)); });
    return () => h && h.destroy();
  }, [v.url, hls]);
  if (emb) return <iframe src={emb} className="h-full w-full" allow="autoplay; fullscreen" allowFullScreen title={v.title} />;
  if (err) return <div className="grid h-full place-items-center p-6 text-center text-sm text-white/70">Ye video format browser me nahi chal raha. Isko MP4 (H.264) me convert karke link do.</div>;
  return <video ref={ref} src={hls ? undefined : src} controls autoPlay playsInline controlsList="nodownload" onError={() => setErr(true)} className="h-full w-full" />;
}

// thumb diya hai (ya YouTube link hai) to image; nahi to direct video ka 1 second wala frame.
function Thumb({ v, className }) {
  const y = ytId(v.url);
  if (v.thumb || y) return <img src={v.thumb || `https://img.youtube.com/vi/${y}/hqdefault.jpg`} alt={v.title} loading="lazy" className={className} />;
  if (v.embed || embedUrl(v.url) || isHls(v.url)) return <div className={className + ' bg-white/10'} />;
  return <video src={`${v.url}#t=1`} preload="metadata" muted playsInline className={className + ' bg-white/10'} />;
}
