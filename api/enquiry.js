// POST /api/enquiry -> validates an enquiry and (optionally) forwards it to a Google Sheet via Apps Script.
// Set env var SHEET_WEBHOOK to your Apps Script web-app URL to store submissions.
const clean = (v, n) => String(v || '').replace(/[<>]/g, '').trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill this
  const rec = { name: clean(b.name, 80), email: clean(b.email, 120), message: clean(b.message, 600), at: new Date().toISOString() };
  if (!rec.name || !/^\S+@\S+\.\S+$/.test(rec.email) || rec.message.length < 5) {
    return res.status(400).json({ error: 'Please provide a valid name, email and message.' });
  }
  try {
    if (process.env.SHEET_WEBHOOK) {
      const r = await fetch(process.env.SHEET_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) });
      if (!r.ok) throw new Error('Sheet webhook failed');
    } else {
      console.log('ENQUIRY', rec); // visible in Vercel function logs
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'Could not store enquiry' });
  }
};
