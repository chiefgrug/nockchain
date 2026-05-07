// NockFights — signup form handler
//
// HOW TO HOOK UP A REAL EMAIL LIST:
// Set ENDPOINT below to a service URL. Drop-in options that just work:
//   - Formspree:    https://formspree.io/f/<your-form-id>
//   - Buttondown:   https://api.buttondown.email/v1/subscribers (with API key)
//   - ConvertKit:   https://api.convertkit.com/v3/forms/<id>/subscribe
//   - Your own backend: any URL accepting JSON { name, email }
//
// Until ENDPOINT is set, signups are stored in localStorage so nothing is lost
// during testing. To export them later:
//   JSON.parse(localStorage.getItem('nockfights_signups'))

const ENDPOINT = '';

// Graceful fallback when rooster images are missing from /assets
const ROOSTER_SVG = `
  <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 25 Q33 18 38 22 Q42 15 47 20 Q51 13 56 19"/>
      <circle cx="45" cy="32" r="10"/>
      <circle cx="48" cy="30" r="1.5" fill="currentColor"/>
      <path d="M55 32 L62 30 L55 35 Z" fill="currentColor"/>
      <path d="M48 38 Q47 44 50 46"/>
      <path d="M40 40 Q25 45 25 65 Q25 85 50 85 Q75 85 78 70 Q80 55 65 45 Q55 40 50 40"/>
      <path d="M75 55 Q90 30 95 55 M75 55 Q88 40 92 60 M75 55 Q85 50 88 65"/>
      <path d="M40 85 L38 100 M50 85 L52 100"/>
      <path d="M38 100 L33 102 M38 100 L43 102 M52 100 L47 102 M52 100 L57 102"/>
    </g>
  </svg>
`;

function swapInPlaceholder(img) {
  const wrap = document.createElement('div');
  wrap.className = `rooster-placeholder ${img.classList.contains('rooster--hero') ? 'rooster--hero' : 'rooster--signup'}`;
  wrap.innerHTML = `
    ${ROOSTER_SVG}
    <p class="placeholder-msg">artwork missing</p>
    <code class="placeholder-path">${img.getAttribute('src')}</code>
  `;
  img.replaceWith(wrap);
}

document.querySelectorAll('img.rooster').forEach((img) => {
  img.addEventListener('error', () => swapInPlaceholder(img));
  if (img.complete && img.naturalWidth === 0) {
    swapInPlaceholder(img);
  }
});

const form = document.getElementById('signup-form');
const status = document.getElementById('form-status');

function showStatus(message, isError = false) {
  status.hidden = false;
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();

  if (!name) {
    showStatus('Need a name to put on the list.', true);
    return;
  }
  if (!isValidEmail(email)) {
    showStatus('That email looks off. Try again.', true);
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sharpening…';

  try {
    if (!ENDPOINT) {
      // Local-only mode (no backend yet)
      const entries = JSON.parse(localStorage.getItem('nockfights_signups') || '[]');
      entries.push({ name, email, ts: Date.now() });
      localStorage.setItem('nockfights_signups', JSON.stringify(entries));
      await new Promise((r) => setTimeout(r, 400)); // tiny delay so it feels real
      showStatus(`You're on the list, ${name}. Sharpen your spurs.`);
      form.reset();
    } else {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showStatus(`You're on the list, ${name}. Sharpen your spurs.`);
      form.reset();
    }
  } catch (err) {
    console.error(err);
    showStatus('Something went wrong. Try again in a moment.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});
