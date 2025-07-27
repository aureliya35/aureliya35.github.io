// server.js – AI Booking Agent for Auréliya Holdings
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const path = require('path');

const app = express();
const stripe = new Stripe('sk_test_12345'); // Replace with your real Stripe secret key

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- AI Agent Core Logic ---
const AIAgent = {
  processBooking: async (data) => {
    console.log("AI Agent processing booking:", data);

    if (data.paymentMethod === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 10000,
        currency: 'usd',
        payment_method: data.stripePaymentId,
        confirm: true,
      });
      console.log('Stripe Payment Confirmed:', paymentIntent.id);
    } else if (data.paymentMethod === 'paypal') {
      console.log('PayPal payment processed.');
    }

    await AIAgent.sendConfirmation(data);
    await AIAgent.logBooking(data);

    return { status: 'success', message: 'Booking processed by AI agent' };
  },

  sendConfirmation: async (data) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aureliya@aureliyaholdings.com',
        pass: 'YOUR_APP_PASSWORD',
      },
    });

    const mailOptions = {
      from: 'aureliya@aureliyaholdings.com',
      to: `${data.email}, aureliya@aureliyaholdings.com`,
      subject: `Booking Confirmation – ${data.event_type}`,
      html: `
        <h2>Thank you, ${data.name}!</h2>
        <p>Your event booking request has been received:</p>
        <ul>
          <li><strong>Event Type:</strong> ${data.event_type}</li>
          <li><strong>Event Date:</strong> ${data.event_date}</li>
          <li><strong>Guests:</strong> ${data.guests}</li>
          <li><strong>Budget:</strong> $${data.budget}</li>
          <li><strong>Message:</strong> ${data.message}</li>
        </ul>
        <p>Our AI team will follow up with tailored options shortly.</p>
        <p>– Auréliya Holdings</p>
      `,
    };

    return transporter.sendMail(mailOptions);
  },

  logBooking: async (data) => {
    console.log('Booking logged for AI agent records:', data);
    return true;
  },
};

app.post('/api/booking', async (req, res) => {
  try {
    const response = await AIAgent.processBooking(req.body);
    res.json(response);
  } catch (error) {
    console.error('Error processing booking:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`AI Agent Backend running on port ${PORT}`));
