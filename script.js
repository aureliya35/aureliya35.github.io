/*
  Generic client‑side scripting for Aureliya Holdings.

  Handles form submissions, basic validation and password‑protected access to
  the dashboard.  Real applications should replace the alerts and prompts with
  secure back‑end integrations.
*/

// The AI engine is attached to the window in ai_engine.js.  The import is
// handled via a separate <script type="module" src="ai_engine.js"></script>
// tag in each HTML file.  This file simply references window.aiEngine if
// available.

/**
 * Generic helper to handle form submissions for service and contact forms.
 * It extracts user input, logs it to the console, triggers the AI engine and
 * provides feedback to the user.  In production, you should replace these
 * stubs with actual network requests to your CRM or email service.
 * @param {HTMLFormElement} form
 */
function handleFormSubmission(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);
    // Level 1 automation: immediately acknowledge the inquiry
    if (window.aiEngine) {
      aiEngine.level1(data);
      aiEngine.level2(data);
      aiEngine.level3(data);
    }
    alert('Thank you for reaching out! Our AI will follow up shortly.');
    form.reset();
  });
}

/**
 * Attach listeners to forms on page load.  Each page can define forms with
 * ids "servicesForm" and "contactForm".
 */
// Immediately execute our initialisation logic once the script has loaded.  Because
// this file is included at the end of each HTML document, the DOM is ready
// when this code runs.
(function init() {
  const servicesForm = document.getElementById('servicesForm');
  const contactForm = document.getElementById('contactForm');
  if (servicesForm) {
    handleFormSubmission(servicesForm);
  }
  if (contactForm) {
    handleFormSubmission(contactForm);
  }
  // Protect dashboard
  const dashboard = document.querySelector('.dashboard');
  // Avoid prompting for password in pages where an inline prompt already exists (dashboard page uses its own prompt).
  if (dashboard && !location.pathname.endsWith('dashboard.html')) {
    requestDashboardAccess(dashboard);
  }
  // Initialise chat widget on all pages except the dashboard (dashboard could still include it if desired)
  if (!location.pathname.endsWith('dashboard.html')) {
    initChatWidget();
  }

  // Handle payment form submissions
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    handlePaymentSubmission(paymentForm);
  }

  // Populate deposit list on dashboard if present
  if (document.getElementById('depositsBody')) {
    populateDeposits();
    // Wire up withdrawal button
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
            // Clear deposits after withdrawal
            localStorage.removeItem('deposits');
            populateDeposits();
          } else {
            alert('There are no deposits to withdraw.');
          }
        }
      });
    }
  }
})();

/**
 * Creates and injects a simple chat widget into the page.  The widget floats
 * at the bottom right and allows a visitor to exchange messages with a basic
 * bot.  The bot currently echoes a friendly acknowledgement.
 */
function initChatWidget() {
  // Create bubble button
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = 'Chat with us';
  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chat-window';
  chatWindow.innerHTML = `
    <header>Chat <button id="closeChat" aria-label="Close chat">×</button></header>
    <div class="chat-messages"></div>
    <form class="chat-input">
      <input type="text" placeholder="Type a message…" required />
      <button type="submit">Send</button>
    </form>
  `;
  document.body.appendChild(bubble);
  document.body.appendChild(chatWindow);
  // Toggle chat window
  bubble.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    bubble.style.display = 'none';
  });
  chatWindow.querySelector('#closeChat').addEventListener('click', () => {
    chatWindow.style.display = 'none';
    bubble.style.display = 'block';
  });
  // Chat functionality
  const messagesContainer = chatWindow.querySelector('.chat-messages');
  const inputForm = chatWindow.querySelector('.chat-input');
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = inputForm.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    // Respond from bot after a short delay
    setTimeout(() => {
      const response = generateBotResponse(text);
      appendMessage(response, 'bot');
    }, 500);
  });
  /**
   * Appends a message bubble to the chat messages container.
   * @param {string} text
   * @param {'user' | 'bot'} type
   */
  function appendMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  /**
   * Generates a simple response from the bot.  Replace this with calls to
   * your AI assistant or back‑end service.
   * @param {string} userMessage
   * @returns {string}
   */
  function generateBotResponse(userMessage) {
    // Basic keyword handling for demonstration
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

/**
 * Handles submission of the deposit payment form.  In a real deployment this would
 * integrate with a payment gateway like Stripe or PayPal.  Here we simply log
 * the deposit and acknowledge the user.  AI levels 1–3 can be used to record
 * the payment, update the CRM and send a receipt.
 * @param {HTMLFormElement} paymentForm
 */
function handlePaymentSubmission(paymentForm) {
  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(paymentForm);
    const amount = formData.get('paymentAmount');
    const method = formData.get('paymentMethod');
    console.log('Deposit submitted:', { amount, method });
    // Use levels 1–3 to acknowledge and log the deposit, including method
    if (window.aiEngine) {
      const depositData = { depositAmount: amount, paymentMethod: method };
      aiEngine.level1(depositData);
      aiEngine.level2(depositData);
      aiEngine.level3(depositData);
    }
    // Persist deposit data in localStorage for the owner dashboard.  Store the
    // method as well so it can be referenced later if needed.
    try {
      const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
      deposits.push({ amount: parseFloat(amount), method, timestamp: Date.now() });
      localStorage.setItem('deposits', JSON.stringify(deposits));
    } catch (e) {
      console.error('Unable to save deposit data', e);
    }
    // Provide user feedback referencing the selected payment method.  In a real
    // implementation this is where you would redirect to your payment
    // gateway (Stripe, PayPal, digital wallet, etc.).
    const methodName = {
      stripe: 'credit card via Stripe',
      paypal: 'PayPal',
      wallet: 'digital wallet'
    }[method] || 'selected method';
    alert(`Thank you! Your $${amount} deposit via ${methodName} has been recorded. A payment link will be sent to your email.`);
    paymentForm.reset();
  });
}

/**
 * Populates the deposits table on the dashboard with data from localStorage.
 * Called when the dashboard page loads.  Also updates the pending payments
 * stat card.  Assumes table with id "depositsTable" and stat element with
 * id "pendingPayments" exist on the page.
 */
function populateDeposits() {
  const tableBody = document.getElementById('depositsBody');
  const pendingEl = document.getElementById('pendingPayments');
  if (!tableBody) return;
  let total = 0;
  try {
    const deposits = JSON.parse(localStorage.getItem('deposits')) || [];
    tableBody.innerHTML = '';
    if (deposits.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3" style="padding:0.5rem 0.4rem;">No deposits yet.</td></tr>';
    } else {
      deposits.forEach((dep) => {
        total += dep.amount;
        const row = document.createElement('tr');
        const date = new Date(dep.timestamp).toLocaleDateString();
        // Determine a human‑friendly name for the payment method
        const methodName = {
          stripe: 'Stripe',
          paypal: 'PayPal',
          wallet: 'Digital Wallet',
          bank: 'Bank Transfer'
        }[dep.method] || (dep.method ? dep.method : 'Unknown');
        row.innerHTML = `
          <td style="padding:0.5rem 0.4rem;">$${dep.amount.toFixed(2)}</td>
          <td style="padding:0.5rem 0.4rem;">${methodName}</td>
          <td style="padding:0.5rem 0.4rem;">${date}</td>
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

/**
 * Prompts the user for a password to reveal the dashboard content.
 * For demonstration purposes only – do not rely on client‑side checks in
 * production.
 * @param {HTMLElement} dashboard
 */
function requestDashboardAccess(dashboard) {
  const password = prompt('This area is restricted. Please enter the owner password:');
  if (password && password.trim() === 'aureliya2025') {
    dashboard.style.display = 'block';
    // Simulate AI analysis of leads when the dashboard is accessed
    if (window.aiEngine) {
      aiEngine.level4();
      aiEngine.level5();
      aiEngine.level6();
    }
  } else {
    alert('Incorrect password. You do not have permission to access this area.');
    dashboard.style.display = 'none';
  }
}