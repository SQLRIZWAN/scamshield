/* =========================================================
   ScamShield — Scam Report Builder  ·  © @sql.ssl
   =========================================================
   NOTE ON THE API KEY
   -------------------------------------------------------
   The Google Gemini API key below is embedded in this
   static site so it works with zero setup. Because the
   site is public, the key is visible to anyone. That is
   the owner's choice. A visitor can override the key in
   their own browser without editing the file:

       localStorage.setItem('ss_gemini_key', 'YOUR_KEY')

   If the AI call ever fails, the app still works fully:
   it falls back to a built-in, offline report template.
   ========================================================= */

const SS = {
  key:
    localStorage.getItem('ss_gemini_key') ||
    'AIzaSyBZKQ933r79xVvqOX1vUtkxWG_l801HB4M',
  models: ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'],
  watermark: '© @sql.ssl',
  portals: {
    nccia: 'https://complaint.nccia.gov.pk/',
    pta: 'https://complaint.pta.gov.pk/',
    bank: 'https://www.sbp.org.pk/',
    meta: 'https://www.instagram.com/',
  },
};

const $ = (id) => document.getElementById(id);
const val = (id) => ($(id) ? $(id).value.trim() : '');

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- gather form data ---------- */
function gather() {
  const flags = Array.from(document.querySelectorAll('.flags input:checked')).map(
    (c) => c.value
  );
  return {
    platform: val('platform'),
    suspect: val('suspect'),
    scamType: val('scamType'),
    loss: val('loss'),
    details: val('details'),
    evidence: val('evidence'),
    reporter: val('reporter'),
    contact: val('contact'),
    city: val('city'),
    flags,
    now: new Date(),
  };
}

/* ---------- prompt for Gemini ---------- */
function buildPrompt(d) {
  const ref = 'WAQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const dt = d.now.toLocaleString('en-GB', { hour12: true });
  return `You are assisting a cyber-security awareness creator (@sql.ssl) to write a formal
online-fraud complaint report for a victim in Pakistan.

Write the report in clear, professional ENGLISH. Then add a short URDU summary
(2-4 lines) at the end under the heading "اردو خلاصہ".
Do not invent facts. Use only the information given. Where information is missing,
write "Not provided".

INCIDENT DATA
- Reference: ${ref}
- Date prepared: ${dt}
- Platform: ${d.platform}
- Suspected account / number / link: ${d.suspect}
- Scam category: ${d.scamType}
- Financial loss (PKR): ${d.loss || 'Not provided'}
- What happened: ${d.details}
- Evidence available: ${d.evidence || 'Not provided'}
- Observed red flags: ${d.flags.length ? d.flags.join('; ') : 'Not provided'}
- Complainant name: ${d.reporter || 'Not provided'}
- Complainant contact: ${d.contact || 'Not provided'}
- Complainant city: ${d.city || 'Not provided'}

FORMAT THE REPORT EXACTLY LIKE THIS (plain text, no markdown symbols):
============================================
ONLINE FRAUD / CYBERCRIME COMPLAINT REPORT
============================================
Reference: ${ref}
Prepared: ${dt}
Prepared with: ScamShield  (${'© @sql.ssl'})

1. COMPLAINANT DETAILS
2. SUSPECT DETAILS
3. CATEGORY OF FRAUD
4. DESCRIPTION OF INCIDENT  (a clear chronological narrative)
5. EVIDENCE AVAILABLE
6. OBSERVED RED FLAGS
7. FINANCIAL LOSS
8. REQUESTED ACTION  (request investigation, freezing of the account/number, and
   action under the relevant law such as PECA 2016)
9. RECOMMENDED REPORTING CHANNELS  (NCCIA helpline 1799 / complaint.nccia.gov.pk;
   PTA 0800-55055 / complaint.pta.gov.pk; the bank's fraud desk; the platform's
   report tool)
10. DECLARATION  (that the information is true to the best of the complainant's knowledge)

اردو خلاصہ:
(2-4 line Urdu summary)

End with a single footer line: ${'© @sql.ssl'}
`;
}

/* ---------- call Gemini ---------- */
async function callGemini(prompt) {
  let lastErr;
  for (const model of SS.models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          SS.key
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
          }),
        }
      );
      if (!res.ok) {
        lastErr = new Error('HTTP ' + res.status);
        continue;
      }
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
      if (text.trim()) return { text: text.trim(), model };
      lastErr = new Error('empty');
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('AI unavailable');
}

/* ---------- offline fallback report ---------- */
function templateReport(d) {
  const ref = 'WAQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const dt = d.now.toLocaleString('en-GB', { hour12: true });
  const L = (v) => v || 'Not provided';
  return `============================================
ONLINE FRAUD / CYBERCRIME COMPLAINT REPORT
============================================
Reference: ${ref}
Prepared: ${dt}
Prepared with: ScamShield  (${SS.watermark})

1. COMPLAINANT DETAILS
   Name: ${L(d.reporter)}
   Contact: ${L(d.contact)}
   City: ${L(d.city)}

2. SUSPECT DETAILS
   Platform: ${L(d.platform)}
   Account / number / link: ${L(d.suspect)}

3. CATEGORY OF FRAUD
   ${L(d.scamType)}

4. DESCRIPTION OF INCIDENT
   ${d.details || 'Not provided'}

5. EVIDENCE AVAILABLE
   ${L(d.evidence)}

6. OBSERVED RED FLAGS
   ${d.flags.length ? d.flags.map((f) => '- ' + f).join('\n   ') : 'Not provided'}

7. FINANCIAL LOSS
   PKR ${d.loss || 'Not provided'}

8. REQUESTED ACTION
   I request the concerned authority to investigate the above matter, freeze the
   beneficiary account / phone number where possible, and take action against the
   suspect under the applicable laws of Pakistan (including PECA 2016).

9. RECOMMENDED REPORTING CHANNELS
   - NCCIA (National Cyber Crime Investigation Agency): helpline 1799, complaint.nccia.gov.pk
   - PTA (SIMS / content takedown): 0800-55055, complaint.pta.gov.pk
   - Bank fraud desk: request immediate freeze of the beneficiary account
   - Platform: use the report tool on the platform where the scam happened

10. DECLARATION
   I declare that the information provided above is true to the best of my knowledge.

اردو خلاصہ:
   مذکورہ اکاؤنٹ/نمبر نے آن لائن فراڈ کیا ہے۔ براہِ کرم تحقیقات کر کے مجرم کے خلاف
   کارروائی کی جائے اور بینک اکاؤنٹ/نمبر فریز کروایا جائے۔
   مدد کے لیے NCCIA ہیلپ لائن 1799 پر رابطہ کیا جا سکتا ہے۔

${SS.watermark}`;
}

/* ---------- render ---------- */
let currentReport = '';
function showReport(text, meta) {
  currentReport = text;
  $('reportOutput').textContent = text;
  $('resultCard').classList.remove('hidden');
  $('aiNote').textContent = meta
    ? `Generated with ${meta} · ${SS.watermark}`
    : `Generated offline (AI unavailable) · ${SS.watermark}`;
  $('resultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- generate ---------- */
async function generate(e) {
  if (e) e.preventDefault();
  const d = gather();
  if (!d.suspect) return toast('Scammer ka username/number likhein');
  if (!d.details) return toast('Kya hua — thoda detail likhein');

  const btn = $('generateBtn');
  btn.disabled = true;
  btn.querySelector('.btn-label').textContent = 'Writing report...';
  $('statusLine').textContent = 'AI report likh raha hai...';

  const prompt = buildPrompt(d);
  try {
    const { text, model } = await callGemini(prompt);
    showReport(text, model);
    $('statusLine').textContent = '';
  } catch (err) {
    console.warn('AI failed, using template:', err);
    showReport(templateReport(d), null);
    $('statusLine').textContent =
      'AI se connect nahi ho saka — offline report bana di hai.';
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-label').textContent = 'Generate Report';
  }
}

/* ---------- example ---------- */
function loadExample() {
  $('platform').value = 'Instagram';
  $('suspect').value = '@fake_hacker_service';
  $('scamType').value = 'Account hack / recovery "service"';
  $('loss').value = '5000';
  $('details').value =
    'Is account ne ad chalaya tha ke wo WhatsApp aur Facebook recover kar dete hain. ' +
    'DM pe baat hui, 5000 rupay advance maange. Easypaisa pe bheje. Paise bhejne ke ' +
    'baad unhone OTP maanga aur phir block kar diya. Koi reply nahi aa raha.';
  $('evidence').value =
    'Screenshots of DM, Easypaisa receipt (TXN 123456), WhatsApp number 03XXXXXXXXX, ' +
    'profile link saved.';
  $('reporter').value = '';
  $('contact').value = '';
  $('city').value = '';
  document.querySelectorAll('.flags input').forEach((c) => (c.checked = false));
  toast('Example load ho gaya — Generate dabayein');
}

/* ---------- copy / download / print ---------- */
async function copyReport() {
  if (!currentReport) return toast('Pehle report banayein');
  try {
    await navigator.clipboard.writeText(currentReport);
    toast('Report clipboard mein copy ho gayi');
  } catch {
    toast('Copy nahi hua — manually select karein');
  }
}
function downloadReport() {
  if (!currentReport) return toast('Pehle report banayein');
  const blob = new Blob([currentReport], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'scamshield-report-' + Date.now() + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Report download ho gayi');
}
function printReport() {
  if (!currentReport) return toast('Pehle report banayein');
  window.print();
}

/* ---------- portal tiles ---------- */
async function openPortal(kind) {
  if (currentReport) {
    try {
      await navigator.clipboard.writeText(currentReport);
      toast('Report copy ho gayi — portal mein paste karein');
    } catch {}
  } else {
    toast('Tip: pehle report generate karein, phir submit karein');
  }
  window.open(SS.portals[kind], '_blank', 'noopener');
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  $('year').textContent = new Date().getFullYear();
  $('scamForm').addEventListener('submit', generate);
  $('demoBtn').addEventListener('click', loadExample);
  $('copyBtn').addEventListener('click', copyReport);
  $('downloadBtn').addEventListener('click', downloadReport);
  $('printBtn').addEventListener('click', printReport);
  document.querySelectorAll('.submit-tile').forEach((t) =>
    t.addEventListener('click', () => openPortal(t.dataset.copyPortal))
  );
});
