// Screenshot ke OCR text se payment ke nishaan dhundta hai. Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, bank apps, sab ke liye.
// OCR ki aam galtiyan (1 ko l/I, 0 ko O) sambhalta hai.
const MON = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' '), M = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)';
export function findDate(text, now = new Date()) {
  const t = text.toLowerCase(); let d, mo, y = null, m;
  if ((m = t.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?[\\s,-]+${M}[a-z]*\\.?,?\\s*(\\d{4})?`)))) { d = +m[1]; mo = MON.indexOf(m[2]); y = m[3] ? +m[3] : null; }
  else if ((m = t.match(new RegExp(`${M}[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})?`)))) { mo = MON.indexOf(m[1]); d = +m[2]; y = m[3] ? +m[3] : null; }
  else if ((m = t.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/))) { d = +m[1]; mo = +m[2] - 1; y = +m[3]; if (y < 100) y += 2000; }
  else return null;
  if (!(d >= 1 && d <= 31) || !(mo >= 0 && mo <= 11)) return null;
  let dt = new Date(y ?? now.getFullYear(), mo, d, 12);
  if (y === null && dt - now > 2 * 864e5) dt = new Date(now.getFullYear() - 1, mo, d, 12); // saal likha nahi: pichhla saal maano
  return dt;
}
const nz = (t) => t.toLowerCase().replace(/o/g, '0').replace(/[il|!]/g, '1').replace(/s/g, '5'); // OCR ke milte-julte akshar ek jaise
const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
export function analyze(words, digits, price, keywords = [], maxAgeDays = 0, now = new Date(), upi = '') {
  const all = `${words}\n${digits}`;
  const n = all.replace(/[Oo]/g, '0').replace(/[lI|]/g, '1');
  const amount = n.split(/\s+/).some((t) => new RegExp(`^\\D{0,4}2?${price}(\\.\\d{1,2})?\\D{0,2}$`).test(t)); // ₹100, Rs.100.00, INR 100
  const m = n.match(/(?:^|\D)(\d{12})(?!\d)/) || n.match(/(?:^|\D)(\d{4} \d{4} \d{4})(?!\d)/);   // UPI Ref / UTR (12 digit)
  const longId = (words.match(/\b[A-Za-z0-9]{18,32}\b/g) || []).find((x) => (x.match(/\d/g) || []).length >= 8); // PhonePe T... / Google txn ID
  const id = m ? m[1].replace(/\s/g, '') : longId || null;
  const ok = /success|paid|complete|sent|received|done|debited|transferred/i.test(words) && !/fail|declin|unsuccess|pending|cancel|not\s+success/i.test(words);
  const brand = /paytm|phonepe|google\s?pay|gpay|bhim|amazon\s?pay|mobikwik|cred|upi|ref\b|utr|transaction|txn|bank|sbi|hdfc|icici|axis|kotak/i.test(words);
  const shown = [...words.matchAll(/(?:₹|rs\.?|inr)\s?(\d[\d,]*(?:\.\d{1,2})?)/gi)].map((x) => parseFloat(x[1].replace(/,/g, '')));
  const wrongAmount = !amount && shown.length > 0 && !shown.includes(price) ? shown[0] : null; // dusra amount dikh raha hai
  const local = nz(upi.split('@')[0] || ''); // receiver ki UPI ID (@ se pehle ka hissa; OCR kabhi @ ko (c)/a padh leta hai)
  const upiOk = !local || words.split(/[\s@©()<>{},;:]+/).some((t) => t.length >= 4 && lev(nz(t), local) <= 1);
  const payee = !keywords.length || keywords.some((k) => all.toLowerCase().includes(k.toLowerCase()));
  const dt = findDate(words, now), stale = !!(maxAgeDays > 0 && dt && (now - dt) / 864e5 > maxAgeDays);
  return { amount, wrongAmount, id, ok, brand, payee, stale, upiOk };
}