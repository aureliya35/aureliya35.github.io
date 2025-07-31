/*
  script.js – Client‑side interaction logic for the revamped Aureliya Holdings site.

  This file centralises all JavaScript for form handling, deposit
  management, basic password protection for the owner dashboard and a simple
  chat widget. It also adds a responsive menu toggle for mobile devices.

  NOTE: Client‑side password checks are not secure. In a real
  deployment you should implement server‑side authentication and restrict
  access at the network level. The password here merely obscures the
  dashboard from casual visitors.
*/

// Handle generic form submissions (services and contact forms)
function handleFormSubmission(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);
    // Basic AI automation levels (if AI engine is present)
    if (window.AIEngine) {
      AIEngine.level1_basicAutomation(data);
      AIEngine.level2_leadTracking(data);
      AIEngine.level3_clientUnderstanding(data);
    }
    alert('Thank you for reaching out! Our team will respond shortly.');
    form.reset();
  });
}

// Handle deposit payments on the contact page
function handlePaymentSubmission(paymentForm) {
  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(paymentForm);
    const amount = parseFloat(formData.get('paymentAmount')) || 0;
    const method = formData.get('paymentMethod');
    console.log('Deposit submitted:', { amount, method });
    // AI levels 1–3 respond to the deposit
    if (window.AIEngine) {
      const depositData = { depositAmount: amount, paymentMethod: method };
      AIEngine.level1_basicAutomation(depositData);
      AIEngine.level2_leadTracking(depositData);
      AIEngine.level3_clientUnderstanding(depositData);
    }
    // Store deposit locally for the dashboard
    try {
      const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
      deposits.push({ amount: amount, method: method, timestamp: Date.now() });
      localStorage.setItem('deposits', JSON.stringify(deposits));
    } catch (e) {
      console.error('Unable to save deposit data', e);
    }
    const methodName = {
      stripe: 'credit card via Stripe',
      paypal: 'PayPal',
      wallet: 'digital wallet',
      bank: 'bank transfer'
    }[method] || 'selected method';
    alert(`Thank you! Your $${amount.toFixed(2)} deposit via ${methodName} has been recorded.`);
    paymentForm.reset();
  });
}

// Populate the deposits table on the dashboard
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
        const methodName = {
          stripe: 'Stripe',
          paypal: 'PayPal',
          wallet: 'Digital Wallet',
          bank: 'Bank Transfer'
        }[dep.method] || (dep.method || 'Unknown');
        row.innerHTML = `
          <td>$${dep.amount.toFixed(2)}</td>
          <td>${methodName}</td>
          <td>${date}</td>
        `;
        tableBody.appendChild(row);
      });
    }
    if (pendingEl) {
      pendingEl.textContent = `$${total.toLocaleString()}`;
    }
  } catch (e) {
    console.error('Unable to load deposits', e);
  }
}

// Simple password prompt for the dashboard
function requestDashboardAccess(dashboard) {
  const password = prompt('This area is restricted. Please enter the owner password:');
  // In production, never store plain text passwords in client code
  if (password && password.trim() === 'aureliya2025') {
    dashboard.style.display = 'block';
    // Trigger higher level AI actions when owner logs in
    if (window.AIEngine) {
      AIEngine.level4_adaptiveStrategy({});
      AIEngine.level5_autonomousMarketing();
      AIEngine.level6_quantumTargeting();
    }
    populateDeposits();
  } else {
    alert('Incorrect password. You do not have permission to access this area.');
    dashboard.style.display = 'none';
  }
}

// Create a floating chat widget that toggles on click
function initChatWidget() {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = 'Chat with us';
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chat-window';
  chatWindow.innerHTML = `
    <header>
      <span>Chat</span>
      <span id="closeChat" style="cursor:pointer">×</span>
    </header>
    <div class="chat-messages"></div>
    <form class="chat-input">
      <input type="text" placeholder="Type your message..." />
      <button type="submit">Send</button>
    </form>
  `;
  document.body.appendChild(bubble);
  document.body.appendChild(chatWindow);
  const messagesContainer = chatWindow.querySelector('.chat-messages');
  const inputForm = chatWindow.querySelector('.chat-input');
  const closeBtn = chatWindow.querySelector('#closeChat');
  bubble.addEventListener('click', () => {
    chatWindow.style.display = 'flex';
    bubble.style.display = 'none';
  });
  closeBtn.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    bubble.style.display = 'block';
  });
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = inputForm.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    setTimeout(() => {
      const response = generateBotResponse(text);
      appendMessage(response, 'bot');
    }, 500);
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
    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello! How can I help you plan your event today?';
    }
    if (lower.includes('price') || lower.includes('cost')) {
      return 'Our pricing varies depending on the event type and size. Please provide details through our contact form.';
    }
    return 'Thank you for your message! A member of our team will respond shortly.';
  }
}

// Initialise all scripts once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Form listeners
  const serviceForm = document.getElementById('servicesForm');
  const contactForm = document.getElementById('contactForm');
  if (serviceForm) handleFormSubmission(serviceForm);
  if (contactForm) handleFormSubmission(contactForm);
  // Payment form
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) handlePaymentSubmission(paymentForm);
  // Dashboard password protection
  const dashboard = document.querySelector('.dashboard');
  const loginBtn = document.getElementById('loginBtn');
  // Use a visible login form instead of a browser prompt. When the correct password is entered,
  // hide the login container and reveal the dashboard. The password is hard‑coded for now.
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
        alert('Incorrect password.');
        if (pwInput) pwInput.value = '';
      }
    });
  }
  // Attach withdrawal handler if present (owner dashboard)
  const withdrawBtn = document.getElementById('withdrawBtn');
  if (withdrawBtn) {
    withdrawBtn.addEventListener('click', () => {
      const methodSelect = document.getElementById('withdrawMethod');
      const method = methodSelect ? methodSelect.value : 'stripe';
      const methodName = {
        stripe: 'Stripe',
        paypal: 'PayPal',
        bank: 'Bank Transfer'
      }[method] || 'Stripe';
      const confirmation = confirm(`Withdraw all collected deposits via ${methodName}?`);
      if (confirmation) {
        const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
        const total = deposits.reduce((acc, dep) => acc + dep.amount, 0);
        if (total > 0) {
          alert(`$${total.toFixed(2)} has been transferred to your account via ${methodName}.`);
          localStorage.removeItem('deposits');
          populateDeposits();
        } else {
          alert('There are no deposits to withdraw.');
        }
      }
    });
  }
  // Chat widget on all pages except the dashboard itself (but inside owner area we may want it hidden)
  if (!window.location.pathname.endsWith('dashboard.html')) {
    initChatWidget();
  }
  // Responsive nav toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('nav ul');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
});