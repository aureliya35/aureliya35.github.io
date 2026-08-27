/* Accessibility-aware client-side interactions for Aureliya Holdings. */

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
  bubble.innerHTML = '<span aria-hidden="true">✦</span> Chat';
  bubble.setAttribute('aria-label', 'Open Aureliya concierge chat');
  bubble.setAttribute('aria-haspopup', 'dialog');
  bubble.setAttribute('aria-expanded', 'false');
  bubble.setAttribute('aria-controls', 'chatWindow');

  const chatWindow = document.createElement('section');
  chatWindow.className = 'chat-window';
  chatWindow.id = 'chatWindow';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-modal', 'true');
  chatWindow.setAttribute('aria-labelledby', 'chatTitle');
  chatWindow.setAttribute('aria-describedby', 'chatDescription');
  chatWindow.hidden = true;
  chatWindow.innerHTML = `
    <header class="chat-header">
      <div>
        <strong id="chatTitle">Aureliya Concierge</strong>
        <div class="chat-subtitle" id="chatDescription">Private event assistance</div>
      </div>
      <button type="button" class="chat-close" id="closeChat" aria-label="Close chat">×</button>
    </header>
    <div class="chat-messages" aria-live="polite" aria-relevant="additions text" aria-atomic="false"></div>
    <div class="chat-quick-replies" aria-label="Suggested questions"></div>
    <form class="chat-input">
      <label for="chatMessage" class="sr-only">Type your message</label>
      <input id="chatMessage" type="text" maxlength="500" placeholder="Ask about events, pricing, or booking…" autocomplete="off" />
      <button type="submit">Send</button>
    </form>`;

  document.body.appendChild(bubble);
  document.body.appendChild(chatWindow);

  const messagesContainer = chatWindow.querySelector('.chat-messages');
  const quickReplies = chatWindow.querySelector('.chat-quick-replies');
  const inputForm = chatWindow.querySelector('.chat-input');
  const input = chatWindow.querySelector('#chatMessage');
  const closeBtn = chatWindow.querySelector('#closeChat');
  let greeted = false;
  let previouslyFocused = null;

  const suggestions = [
    ['What do you plan?', 'We help coordinate private celebrations, luxury experiences, corporate events, VIP occasions, and custom concepts. If your event does not fit a standard category, that is completely fine.'],
    ['How does pricing work?', 'Pricing is tailored to the scope, guest count, location, timing, and level of coordination involved. The best next step is to share a few details through the Contact page so a custom response can be prepared.'],
    ['How do I get started?', 'You can begin by sharing your event type, preferred date, approximate guest count, budget range, and any details that matter most to you. Use the Contact page whenever you are ready.']
  ];

  function getFocusableElements() {
    return Array.from(chatWindow.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hidden && el.offsetParent !== null);
  }

  function openChat() {
    previouslyFocused = document.activeElement;
    chatWindow.hidden = false;
    chatWindow.style.display = 'flex';
    bubble.style.display = 'none';
    bubble.setAttribute('aria-expanded', 'true');
    document.body.classList.add('chat-open');
    if (!greeted) {
      appendMessage('Welcome to Aureliya. I can answer a few common questions and help point you in the right direction. What would you like to know?', 'bot');
      renderQuickReplies();
      greeted = true;
    }
    input.focus();
  }

  function closeChat() {
    chatWindow.hidden = true;
    chatWindow.style.display = 'none';
    bubble.style.display = 'inline-flex';
    bubble.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('chat-open');
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    else bubble.focus();
  }

  function renderQuickReplies() {
    quickReplies.innerHTML = '';
    suggestions.forEach(([label, response]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chat-quick-reply';
      button.textContent = label;
      button.addEventListener('click', () => {
        appendMessage(label, 'user');
        appendMessage(response, 'bot');
        quickReplies.innerHTML = '';
        input.focus();
      });
      quickReplies.appendChild(button);
    });
  }

  bubble.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  chatWindow.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeChat();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = getFocusableElements();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    appendMessage(text, 'user');
    input.value = '';
    quickReplies.innerHTML = '';
    window.setTimeout(() => appendMessage(generateBotResponse(text), 'bot'), 250);
  });

  function appendMessage(text, type) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-row ${type}`;
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    wrapper.appendChild(message);
    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function generateBotResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(lower)) return 'Hello. I’m glad you stopped by. I can help with general questions about Aureliya, event planning, pricing, or how to get started.';
    if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('budget') || lower.includes('fee')) return 'Aureliya uses custom pricing because every event is different. Scope, guest count, location, timing, and level of support all affect the proposal. You can share your details on the Contact page for a tailored response.';
    if (lower.includes('wedding') || lower.includes('birthday') || lower.includes('party') || lower.includes('gala') || lower.includes('corporate') || lower.includes('vip') || lower.includes('event')) return 'Aureliya can support a range of private and professional events, including celebrations, VIP experiences, corporate occasions, and custom concepts. Tell me what you are planning and I can suggest what information to include when you contact us.';
    if (lower.includes('book') || lower.includes('booking') || lower.includes('reserve') || lower.includes('start') || lower.includes('consult')) return 'The easiest way to begin is through the Contact page. Include your preferred date, event type, estimated guest count, budget range, and any priorities or special details.';
    if (lower.includes('contact') || lower.includes('email') || lower.includes('reach')) return 'You can use the Contact page to send your event details directly. You can also email aureliya@aureliyaholdings.com.';
    if (lower.includes('deposit') || lower.includes('payment') || lower.includes('stripe')) return 'Secure payment options are available through the Contact page when applicable. If you have a payment-specific question, include it with your inquiry so it can be reviewed carefully.';
    if (lower.includes('privacy') || lower.includes('private') || lower.includes('confidential')) return 'Discretion is an important part of the Aureliya approach. The experience is designed to feel personal and private, with only the information needed to coordinate your request collected.';
    if (lower.includes('who are you') || lower.includes('human') || lower.includes('real person') || lower.includes('bot') || lower.includes('ai')) return 'I’m the website concierge, a simple automated guide for common questions. I do not replace direct communication with Aureliya. For anything personal, detailed, or time-sensitive, please use the Contact page.';
    if (lower.includes('thank')) return 'You’re very welcome. If you decide to move forward, the Contact page is the best place to share the details of what you have in mind.';
    return 'I can help with general questions about event types, pricing, booking, payments, privacy, and contacting Aureliya. For anything more specific, please use the Contact page so your request can receive a tailored response.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('main').forEach(main => {
    if (!main.id) main.id = 'main-content';
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  });

  document.querySelectorAll('header nav').forEach(nav => nav.setAttribute('aria-label', 'Primary navigation'));
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
        }
        if (pwInput) pwInput.value = '';
      }
    });
  }

  if (!window.location.pathname.endsWith('dashboard.html')) initChatWidget();
});
