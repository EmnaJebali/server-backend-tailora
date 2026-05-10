const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Payment Intent (optional, keep for reference)
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Checkout Session (hosted page)
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, orderDescription } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: orderDescription || 'Tailora Order',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://tailora.app/success?session_id={CHECKOUT_SESSION_ID}'',
      cancel_url: 'https://tailora.app/cancel'',
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Success page
app.get('/success', (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          window.location.href = 'tailora://payment-success?session_id=' + 
          new URLSearchParams(window.location.search).get('session_id');
        </script>
        <p>Payment successful! Redirecting back to app...</p>
      </body>
    </html>
  `);
});

// Cancel page
app.get('/cancel', (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          window.location.href = 'tailora://payment-cancel';
        </script>
        <p>Payment cancelled. Redirecting back to app...</p>
      </body>
    </html>
  `);
});

// ALWAYS last
app.listen(3000, () => console.log('Server running'));
