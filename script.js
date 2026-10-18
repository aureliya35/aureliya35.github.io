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
  bubble.setAttribute('aria-label', 'Open Aureliya event planning chat');
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
          <strong id="chatTitle">Aureliya Planning Guide</strong>
          <div class="chat-subtitle" id="chatDescription">Remote planning information</div>
        </div>
      </div>
      <button type="button" class="chat-close" id="closeChat" aria-label="Close chat">×</button>
    </header>
    <div class="chat-screen" id="chatHomeScreen">
      <div class="chat-home-intro">
        <p class="chat-home-kicker">Welcome</p>
        <h2>How can I help?</h2>
        <p>Get preset answers about remote planning for Boston events. For service details or availability, contact Aureliya directly.</p>
      </div>
      <div class="chat-home-actions" aria-label="Chat topics">
        <button type="button" class="chat-topic" data-topic="planning"><strong>Planning an event</strong><span>Private celebrations and business events.</span></button>
        <button type="button" class="chat-topic" data-topic="budget"><strong>Planning your budget</strong><span>Share your budget and priorities.</span></button>
        <button type="button" class="chat-topic" data-topic="scope"><strong>Remote planning scope</strong><span>Understand what remote support covers.</span></button>
        <button type="button" class="chat-topic" data-topic="inquiry"><strong>Send an inquiry</strong><span>See what to include when you reach out.</span></button>
        <button type="button" class="chat-topic" data-topic="conversation"><strong>Common questions</strong><span>Find service and contact information.</span></button>
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
      message: 'Aureliya offers remote planning support for private celebrations and business events in Boston, Massachusetts. Support includes budgets, venue and vendor research, schedules, and planning coordination.',
      replies: ['Private celebration', 'Business event', 'What does remote planning include?', 'How do I get started?']
    },
    budget: {
      message: 'Share an estimated event budget or range and your priorities in your inquiry. Contact Aureliya directly to discuss service scope and fees; this chat cannot confirm prices.',
      replies: ['Can I give a budget range?', 'What details should I send?', 'How do I contact Aureliya?']
    },
    scope: {
      message: 'All planning support is provided remotely. Aureliya does not attend events onsite. Onsite staffing and event-day services require separately agreed local coverage.',
      replies: ['What does remote planning include?', 'Do you attend onsite?', 'How do I contact Aureliya?']
    },
    inquiry: {
      message: 'Use the Contact page to share your event type, preferred date, location, guest count, budget range, and the planning help you need. An inquiry does not confirm a booking.',
      replies: ['What details should I send?', 'What if my date is flexible?', 'How do I contact Aureliya?']
    },
    conversation: {
      message: 'I can share preset information about remote event planning and how to contact Aureliya. I cannot confirm availability, prices, bookings, or local coverage.',
      replies: ['What does Aureliya do?', 'How do I get started?', 'Do you attend onsite?', 'Do you use AI?']
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
    chatWindow.querySelector('#chatDescription').textContent = 'Remote planning information';
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
      appendMessage('Welcome to Aureliya. This automated guide answers common questions about remote event planning.', 'bot');
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
    let replies = ['How do I get started?', 'What does remote planning include?', 'How do I contact Aureliya?'];
    if (/price|pricing|budget|quote|fee|deposit|payment/.test(lower)) replies = ['Can I give a budget range?', 'What details should I send?', 'How do I contact Aureliya?'];
    else if (/event|celebration|business|corporate/.test(lower)) replies = ['What details should I send?', 'Do you attend onsite?', 'How do I contact Aureliya?'];
    else if (/privacy|confidential|information/.test(lower)) replies = ['What information do you need?', 'Do you use AI?', 'How do I contact a person?'];
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
    if (/on[ -]?site|in[ -]?person|event[ -]?day|local coverage|staffing/.test(lower)) return 'All planning support is provided remotely. Aureliya does not attend events onsite. Onsite staffing and event-day services require separately agreed local coverage. This chat cannot confirm that coverage has been arranged.';
    if (/\b(deposit|payment|stripe|paypal)\b/.test(lower)) return 'This chat cannot confirm payment or deposit terms. Contact Aureliya directly with questions about any proposed service. The inquiry form does not take payment.';
    if (/\b(price|prices|pricing|cost|costs|fee|fees|quote)\b/.test(lower)) return 'Please contact Aureliya to discuss the scope and fees for your request. This chat cannot confirm prices. Include your event type, date, location, guest count, and budget range in your inquiry.';
    if (lower.includes('budget')) return 'An estimated event budget or range is helpful. Include your guest count and priorities so you can discuss the planning support you need. Service scope and fees must be confirmed directly with Aureliya.';
    if (lower.includes('what details') || lower.includes('details should i send') || lower.includes('what information')) return 'Share your name, email, event type, preferred date, location, approximate guest count, budget range, and the planning help you need. You can send these through the Contact page.';
    if (/\b(contact|email|reach|person|human)\b/.test(lower)) return 'Use the Contact page to send an event inquiry, or email aureliya@aureliyaholdings.com.';
    if (lower.includes('confidential') || lower.includes('privacy')) return 'Please share only the contact and event details needed for your inquiry. Avoid sending payment details or sensitive guest information. Contact Aureliya directly with privacy questions; this guide cannot give confidentiality guarantees.';
    if (/\b(ai|automated|automation|bot)\b/.test(lower)) return 'This chat uses preset automated answers to common questions. It does not generate event proposals or confirm availability, prices, bookings, or local coverage. Use the Contact page for a direct inquiry.';
    if (/\b(vip|concierge)\b/.test(lower)) return 'The services described here are remote planning for private celebrations and business events in Boston. For a different request, contact Aureliya to check whether it fits the available scope.';
    if (lower.includes('date is flexible') || lower.includes('flexible date')) return 'Include your preferred date range or a few possible dates in your inquiry. Availability must be confirmed directly with Aureliya.';
    if (/\b(book|booking|reserve|availability|available|consultation)\b/.test(lower) || lower.includes('far ahead') || lower.includes('how early')) return 'Send an inquiry through the Contact page with your preferred date and event details. Aureliya must confirm availability and service scope directly. This chat and the inquiry form do not confirm bookings.';
    if (lower.includes('get started') || lower.includes('start')) return 'Start with your event type, preferred date, location, approximate guest count, budget range, and the planning help you need. Send these through the Contact page or email aureliya@aureliyaholdings.com.';
    if (/\b(wedding|birthday|celebration|celebrations|private)\b/.test(lower)) return 'Remote planning for private celebrations can include defining priorities, comparing venue and vendor options, organizing a budget, and creating a schedule. Share your celebration details through the Contact page to discuss the scope.';
    if (/\b(corporate|business)\b/.test(lower)) return 'Remote planning for business events focuses on the event purpose, guests, budget, venue and vendor research, planning timelines, and coordination before the event. Share your details through the Contact page.';
    if (lower.includes('custom')) return 'Describe the planning help you need in your inquiry. Confirm the service scope directly with Aureliya before making arrangements.';
    if (lower.includes('what does aureliya do') || lower.includes('what do you do') || lower.includes('remote') || lower.includes('planning') || lower.includes('what events') || lower.includes('tell me more')) return 'Aureliya offers remote planning support for private celebrations and business events in Boston, Massachusetts. Support includes budgets, venue and vendor research, schedules, and planning coordination.';
    if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(lower)) return 'Hello. I can share information about remote event planning for Boston and help you find the Contact page.';
    if (lower.includes('thank')) return 'You’re welcome. You can return to the main chat menu with the back arrow or ask another question.';
    return 'I can share preset information about remote planning for private celebrations and business events in Boston. For questions about your specific event, use the Contact page or email aureliya@aureliyaholdings.com.';
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

