# Aureliya Holdings – Luxury Event Website

This repository contains a ready‑to‑launch, seven‑page website for **Aureliya Holdings**, a privacy‑focused luxury event planning and concierge brand.  It is designed to be published on GitHub Pages and includes sample code for integrating AI‑driven automation into the customer experience.

## Pages included

| Page | Purpose |
| --- | --- |
| **Home** (`index.html`) | Introduces Aureliya Holdings with a hero image, a tagline, highlights of services, and a call‑to‑action. |
| **Services** (`services.html`) | Lists event planning, VIP concierge, public‑relations pop‑ups and automation tiers. Includes a form that triggers follow‑up scripts. |
| **About** (`about.html`) | Explains the mission and vision of the company and emphasises the privacy‑first trust model. |
| **Contact** (`contact.html`) | Contains a detailed form (event type, budget, date, guest count) for prospective clients. |
| **Portfolio** (`portfolio.html`) | Displays mock event imagery. The images in the `/assets` folder can be replaced with real photography as your portfolio grows. |
| **Blog / News** (`blog.html`) | A placeholder blog page showing how AI could auto‑generate news or trends. |
| **Dashboard (private)** (`dashboard.html`) | A password‑protected owner area used to monitor inquiries, payments, and marketing leads. |

## AI integration

The site ships with a client‑side `ai_engine.js` file containing function stubs for six levels of automation.  While these functions don’t connect to a back‑end by default, they outline where to implement your AI logic.  For example:

* **Level 1 – Basic automation:** automatically responds to form submissions with polite acknowledgements.
* **Level 2 – Lead tracking:** logs inquiries and flags VIPs based on budget or guest count.
* **Level 3 – Client understanding:** examines form data to infer client preferences.
* **Level 4 – Adaptive strategy:** prepares customised event proposals.
* **Level 5 – Autonomous marketing:** could post your business to event directories.
* **Level 6 – Quantum targeting:** (placeholder) for advanced, trend‑based lead discovery.

You can replace the stubbed functions with calls to your own AI services or third‑party APIs.

## Running locally

Open any of the `.html` files in a web browser.  The pages are self contained and rely only on the included `style.css`, `script.js`, and `ai_engine.js`.  To deploy on GitHub Pages, push this repository to GitHub and enable Pages in the repository settings.

## Customisation

* **Branding:** Replace the images in `/assets` with your own photography.  Update colours in `style.css` to match your brand palette.
* **Forms:** The contact and services forms currently call dummy functions defined in `script.js` and `ai_engine.js`.  To integrate with real email or CRM services, replace these calls with your own logic.
* **Dashboard security:** The dashboard uses a simple password prompt.  For production use you should implement proper authentication on the server side.

## Inspiration

When designing this template we drew on research into luxury websites and event planner sites.  High‑end consumers appreciate minimalist layouts, intuitive navigation and high‑quality visuals【608844591116869†L60-L90】.  The design uses generous white space, elegant typography and a refined colour palette to convey trust and exclusivity.  Trustworthiness also depends on good organisation, clear content and up‑front disclosure【267697682475391†L89-L118】.  AI tools can quietly handle repetitive tasks, such as scheduling and attendee inquiries, freeing your team to focus on creativity【18277902331448†L172-L176】.

# Auréliya Holdings – Booking System (v5)

### Changes:
- "Submit Booking" button now appears after the payment section but before the footer.
- AI agent backend is fully included.
- Payment methods remain selectable via dropdown.

## Setup
1. Unzip.
2. Run `npm init -y` and `npm install express body-parser nodemailer stripe`.
3. Update `server.js` with real Stripe keys and email credentials.
4. Run `node server.js`.
5. Visit http://localhost:3000.
