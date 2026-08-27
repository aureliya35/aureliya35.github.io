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
      <div class="chat-header-left">
        <button type="button" class="chat-nav-button" id="chatBack" aria-label="Go back" hidden>←</button>
        <div>
          <strong id="chatTitle">Aureliya Concierge</strong>
          <div class="chat-subtitle" id="chatDescription">Private event assistance</div>
        </div>
      </div>
      <button type="button" class="chat-close" id="closeChat" aria-label="Close chat">×</button>
    </header>
    <div class="chat-screen" id="chatHomeScreen">
      <div class="chat-home-intro">
        <p class="chat-home-kicker">Welcome</p>
        <h2>How can I help?</h2>
        <p>Choose a topic below or start a conversation. You can move back and forth without losing your messages.</p>
      </div>
      <div class="chat-home-actions" aria-label="Chat topics">
        <button type="button" class="chat-topic" data-topic="planning"><strong>Planning an event</strong><span>Tell me what you have in mind.</span></button>
        <button type="button" class="chat-topic" data-topic="pricing"><strong>Pricing & budget</strong><span>Learn how custom pricing works.</span></button>
        <button type="button" class="chat-topic" data-topic="booking"><strong>Booking & availability</strong><span>See what to include when you reach out.</span></button>
        <button type="button" class="chat-topic" data-topic="privacy"><strong>Privacy & discretion</strong><span>Learn how Aureliya approaches private requests.</span></button>
        <button type="button" class="chat-topic" data-topic="conversation"><strong>Open conversation</strong><span>Ask anything about Aureliya.</span></button>
      </div>
    </div>
    <div class="chat-screen" id="chatConversationScreen" hidden>
      <div class="chat-messages" aria-live="polite" aria-relevant="additions text" aria-atomic="false"></div>
      <div class="chat-quick-replies" aria-label="Suggested replies"></div>
      <form class="chat-input">
        <label for="chatMessage" class="sr-only">Type your message</label>
        <input id="chatMessage" type="text" maxlength="500" placeholder="Type your message…" autocomplete="off" />
        <button type="submit">Send</button>
      </form>
    </div>`;

  document.body.appendChild(bubble);
  document.body.appendChild(chatWindow);

  const homeScreen = chatWindow.querySelector('#chatHomeScreen');
  const conversationScreen = chatWindow.querySelector('#chatConversationScreen');
  const messagesContainer = chatWindow.querySelector('.chat-messages');
  const quickReplies = chatWindow.querySelector('.chat-quick-replies');
  const inputForm = chatWindow.querySelector('.chat-input');
  const input = chatWindow.querySelector('#chatMessage');
  const closeBtn = chatWindow.querySelector('#closeChat');
  const backBtn = chatWindow.querySelector('#chatBack');
  const topicButtons = Array.from(chatWindow.querySelectorAll('.chat-topic'));
  let greeted = false;
  let previouslyFocused = null;
  let currentScreen = 'home';

  const topicOpeners = {
    planning: {
      message: 'I’d be happy to help you think through your event. What kind of experience are you planning?',
      replies: ['Wedding or celebration', 'Corporate event', 'VIP or private experience', 'Something custom']
    },
    pricing: {
      message: 'Aureliya uses custom pricing rather than one fixed package. The proposal depends on scope, location, guest count, timing, and how much coordination you need.',
      replies: ['What affects the price?', 'Can I give a budget range?', 'Is there a deposit?', 'How do I request a quote?']
    },
    booking: {
      message: 'For booking, the most helpful details are your preferred date, event type, approximate guest count, location, budget range, and any priorities that matter most.',
      replies: ['How far ahead should I book?', 'What if my date is flexible?', 'How do I contact Aureliya?', 'Can I book a consultation?']
    },
    privacy: {
      message: 'Discretion is part of the Aureliya approach. The goal is to collect only the information needed to understand and coordinate your request.',
      replies: ['What information do you need?', 'Are requests confidential?', 'Do you use AI?', 'How do I contact a person?']
    },
    conversation: {
      message: 'Of course. Ask me anything about Aureliya, planning, pricing, booking, payments, privacy, or getting started.',
      replies: ['What does Aureliya do?', 'How do I get started?', 'What events do you handle?', 'How do I reach you?']
    }
  };

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
    showHome();
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

  function showHome() {
    currentScreen = 'home';
    homeScreen.hidden = false;
    conversationScreen.hidden = true;
    backBtn.hidden = true;
    chatWindow.querySelector('#chatDescription').textContent = 'Private event assistance';
    const firstTopic = topicButtons[0];
    if (firstTopic) firstTopic.focus();
  }

  function showConversation() {
    currentScreen = 'conversation';
    homeScreen.hidden = true;
    conversationScreen.hidden = false;
    backBtn.hidden = false;
    chatWindow.querySelector('#chatDescription').textContent = 'Conversation';
    input.focus();
  }

  function startTopic(topic) {
    showConversation();
    const opener = topicOpeners[topic] || topicOpeners.conversation;
    if (!greeted) {
      appendMessage('Welcome to Aureliya. I can help answer common questions and guide you toward the next step.', 'bot');
      greeted = true;
    }
    appendMessage(opener.message, 'bot');
    renderQuickReplies(opener.replies);
  }

  function renderQuickReplies(labels) {
    quickReplies.innerHTML = '';
    labels.forEach(label => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chat-quick-reply';
      button.textContent = label;
      button.addEventListener('click', () => {
        appendMessage(label, 'user');
        appendMessage(generateBotResponse(label), 'bot');
        renderFollowUps(label);
        input.focus();
      });
      quickReplies.appendChild(button);
    });
  }

  function renderFollowUps(lastMessage) {
    const lower = lastMessage.toLowerCase();
    let replies = ['How do I get started?', 'How do I contact Aureliya?', 'Tell me more'];
    if (lower.includes('price') || lower.includes('budget') || lower.includes('quote')) replies = ['What affects the price?', 'Is there a deposit?', 'How do I request a quote?'];
    if (lower.includes('wedding') || lower.includes('event') || lower.includes('celebration')) replies = ['What details should I send?', 'How far ahead should I book?', 'Can it be customized?'];
    if (lower.includes('privacy') || lower.includes('confidential')) replies = ['What information do you collect?', 'Do you use AI?', 'How do I contact a person?'];
    renderQuickReplies(replies);
  }

  topicButtons.forEach(button => button.addEventListener('click', () => startTopic(button.dataset.topic)));
  bubble.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  backBtn.addEventListener('click', showHome);

  chatWindow.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (currentScreen === 'conversation') showHome();
      else closeChat();
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
    window.setTimeout(() => {
      appendMessage(generateBotResponse(text), 'bot');
      renderFollowUps(text);
    }, 180);
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
    if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(lower)) return 'Hello. I’m glad you stopped by. I can help with planning, pricing, booking, privacy, payments, or how to get started.';
    if (lower.includes('what does aureliya do') || lower.includes('what do you do')) return 'Aureliya is focused on thoughtful event coordination and private concierge-style support. The goal is to make the experience feel polished, personal, and quietly organized.';
    if (lower.includes('wedding') || lower.includes('celebration')) return 'Yes. Celebrations can be approached in a highly customized way. It helps to share your preferred date, location, guest count, style, priorities, and budget range.';
    if (lower.includes('corporate')) return 'Corporate occasions can include private dinners, galas, launches, executive experiences, and custom events. The best starting point is the size, purpose, date, location, and desired atmosphere.';
    if (lower.includes('vip') || lower.includes('private experience')) return 'Private and VIP experiences can be tailored around discretion, timing, access, hospitality, and the level of hands-on coordination you want.';
    if (lower.includes('custom')) return 'Custom concepts are welcome. You do not need to fit into a standard event category. Share the outcome or feeling you want to create, and the details can be shaped around that.';
    if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('fee')) return 'Pricing is customized because each request can vary significantly. Location, guest count, timeline, vendors, complexity, and the amount of coordination all affect the final proposal.';
    if (lower.includes('budget range') || lower.includes('give a budget')) return 'Yes. A budget range is useful because it helps frame the scale and options that make sense without requiring you to know every detail in advance.';
    if (lower.includes('affect') && lower.includes('price')) return 'The biggest pricing factors are usually event size, location, date, vendor needs, travel, production complexity, and how much planning or concierge support is required.';
    if (lower.includes('quote')) return 'To request a tailored quote, use the Contact page and include your event type, date, location, guest count, budget range, and anything that is especially important to you.';
    if (lower.includes('deposit')) return 'A deposit may be used when applicable to reserve or move forward with services. The exact amount and terms should be confirmed as part of your specific proposal.';
    if (lower.includes('far ahead') || lower.includes('how early')) return 'Earlier is generally better for events with a fixed date or complex vendor needs, but flexible and shorter-timeline requests can still be worth asking about.';
    if (lower.includes('date is flexible') || lower.includes('flexible date')) return 'A flexible date can create more options. Mention your preferred range or a few possible dates when you contact Aureliya.';
    if (lower.includes('book') || lower.includes('booking') || lower.includes('reserve') || lower.includes('consult')) return 'The best way to begin is through the Contact page. Share the essentials first; you do not need to have every detail decided.';
    if (lower.includes('details should i send') || lower.includes('what details')) return 'The most useful details are your event type, preferred date, location, approximate guest count, budget range, priorities, and anything you want the experience to feel like.';
    if (lower.includes('contact') || lower.includes('email') || lower.includes('reach')) return 'You can use the Contact page to send your details directly. You can also email aureliya@aureliyaholdings.com.';
    if (lower.includes('confidential') || lower.includes('privacy')) return 'Discretion is an important part of the Aureliya approach. Requests are meant to be handled with care, and only the information needed to understand and coordinate the request should be collected.';
    if (lower.includes('what information do you collect') || lower.includes('what information do you need')) return 'Usually only practical planning details are needed at first: contact information, event basics, timing, guest count, budget range, and the preferences you choose to share.';
    if (lower.includes('ai')) return 'The website uses automated assistance for common questions. It is meant to make navigation easier, not replace direct communication for personal or detailed requests.';
    if (lower.includes('person') || lower.includes('human')) return 'For anything personal, detailed, or time-sensitive, use the Contact page or email aureliya@aureliyaholdings.com so your request can be reviewed directly.';
    if (lower.includes('payment') || lower.includes('stripe')) return 'Secure payment options may be provided when applicable. Payment details and terms should be confirmed as part of your specific arrangement.';
    if (lower.includes('get started') || lower.includes('start')) return 'Start with the basics: what you are planning, when and where you want it, approximate guest count, budget range, and what matters most to you. Then send that through the Contact page.';
    if (lower.includes('tell me more')) return 'Aureliya is intentionally flexible. The idea is to adapt the support around the experience you want rather than force every request into the same package.';
    if (lower.includes('thank')) return 'You’re very welcome. You can return to the main chat menu anytime with the back arrow, or continue asking questions here.';
    return 'I can help with planning, pricing, booking, payments, privacy, and getting started. If your question is more specific, tell me a little about what you are trying to plan and I’ll guide you from there.';
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
