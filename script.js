/* Accessibility-aware client-side interactions for Aureliya Holdings. */

function handleFormSubmission(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (window.AIEngine) {
      AIEngine.level1_basicAutomation(data);
      AIEngine.level2_leadTracking(data);
      AIEngine.level3_clientUnderstanding(data);
    }
    const amountRaw = formData.get('paymentAmount');
    const method = formData.get('paymentMethod');
    if (amountRaw && method) {
      const amount = parseFloat(amountRaw) || 0;
      try {
        const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
        deposits.push({ amount, method, timestamp: Date.now() });
        localStorage.setItem('deposits', JSON.stringify(deposits));
      } catch (e) {
        console.error('Unable to save deposit data', e);
      }
    }
  });
}

function handlePaymentSubmission(paymentForm) {
  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });
}

function populateDeposits() {
  const tableBody = document.getElementById('depositsBody');
  const pendingEl = document.getElementById('pendingPayments');
  if (!tableBody) return;
  let total = 0;
  try {
    const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
    tableBody.innerHTML = '';
    if (deposits.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.setAttribute('colspan', '3');
      cell.textContent = 'No deposits yet.';
      row.appendChild(cell);
      tableBody.appendChild(row);
    } else {
      deposits.forEach(dep => {
        total += dep.amount;
        const row = document.createElement('tr');
        const date = new Date(dep.timestamp).toLocaleDateString();
        const methodName = { stripe: 'Stripe', paypal: 'PayPal', wallet: 'Digital Wallet', bank: 'Bank Transfer' }[dep.method] || (dep.method || 'Unknown');
        row.innerHTML = `<td>$${dep.amount.toFixed(2)}</td><td>${methodName}</td><td>${date}</td>`;
        tableBody.appendChild(row);
      });
    }
    if (pendingEl) pendingEl.textContent = `$${total.toLocaleString()}`;
  } catch (e) {
    console.error('Unable to load deposits', e);
  }
}

function initChatWidget() {
  const bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'chat-bubble';
  bubble.textContent = 'Chat with us';
  bubble.setAttribute('aria-haspopup', 'dialog');
  bubble.setAttribute('aria-expanded', 'false');
  bubble.setAttribute('aria-controls', 'chatWindow');

  const chatWindow = document.createElement('section');
  chatWindow.className = 'chat-window';
  chatWindow.id = 'chatWindow';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-modal', 'false');
  chatWindow.setAttribute('aria-labelledby', 'chatTitle');
  chatWindow.innerHTML = `
    <header>
      <span id="chatTitle">Chat</span>
      <button type="button" class="chat-close" id="closeChat" aria-label="Close chat">×</button>
    </header>
    <div class="chat-messages" aria-live="polite" aria-relevant="additions"></div>
    <form class="chat-input">
      <label for="chatMessage" class="sr-only">Type your message</label>
      <input id="chatMessage" type="text" placeholder="Type your message..." autocomplete="off" />
      <button type="submit">Send</button>
    </form>`;

  document.body.appendChild(bubble);
  document.body.appendChild(chatWindow);

  const messagesContainer = chatWindow.querySelector('.chat-messages');
  const inputForm = chatWindow.querySelector('.chat-input');
  const input = chatWindow.querySelector('#chatMessage');
  const closeBtn = chatWindow.querySelector('#closeChat');

  function openChat() {
    chatWindow.style.display = 'flex';
    bubble.style.display = 'none';
    bubble.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  function closeChat() {
    chatWindow.style.display = 'none';
    bubble.style.display = 'block';
    bubble.setAttribute('aria-expanded', 'false');
    bubble.focus();
  }

  bubble.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  chatWindow.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeChat();
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    window.setTimeout(() => appendMessage(generateBotResponse(text), 'bot'), 500);
  });

  function appendMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function generateBotResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return 'Hello! How can I help you plan your event today?';
    if (lower.includes('price') || lower.includes('cost')) return 'Our pricing varies depending on the event type and size. Please provide details through our contact form.';
    return 'Thank you for your message! A member of our team will respond shortly.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('main').forEach(main => {
    if (!main.id) main.id = 'main-content';
  });

  document.querySelectorAll('header nav').forEach(nav => {
    nav.setAttribute('aria-label', 'Primary navigation');
  });

  const current = document.querySelector('nav a.active');
  if (current) current.setAttribute('aria-current', 'page');

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('nav ul');
  if (menuToggle && navLinks) {
    if (menuToggle.tagName !== 'BUTTON') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = menuToggle.className;
      button.innerHTML = menuToggle.innerHTML;
      menuToggle.replaceWith(button);
    }
    const toggle = document.querySelector('.menu-toggle');
    if (!navLinks.id) navLinks.id = 'primary-navigation';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-controls', navLinks.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        toggle.focus();
      }
    });
  }

  const serviceForm = document.getElementById('servicesForm');
  const contactForm = document.getElementById('contactForm');
  if (serviceForm) handleFormSubmission(serviceForm);
  if (contactForm) handleFormSubmission(contactForm);
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) handlePaymentSubmission(paymentForm);

  const dashboard = document.querySelector('.dashboard');
  const loginBtn = document.getElementById('loginBtn');
  if (dashboard && loginBtn) {
    loginBtn.addEventListener('click', () => {
      const pwInput = document.getElementById('dashboardPassword');
      const pw = pwInput ? pwInput.value.trim() : '';
      if (pw === 'aureliya2025') {
        const loginContainer = document.getElementById('loginContainer');
        if (loginContainer) loginContainer.style.display = 'none';
        dashboard.style.display = 'block';
        populateDeposits();
      } else {
        const status = document.getElementById('loginStatus');
        if (status) {
          status.textContent = 'Incorrect password.';
          status.focus();
        } else {
          alert('Incorrect password.');
        }
        if (pwInput) pwInput.value = '';
      }
    });
  }

  if (!window.location.pathname.endsWith('dashboard.html')) initChatWidget();
});
