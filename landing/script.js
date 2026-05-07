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
