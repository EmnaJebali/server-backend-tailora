const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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
      success_url: 'https://tailora.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://tailora.app/cancel',
    });
    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/success', (req, res) => {
  res.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Payment Successful</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; } .card { background: white; border-radius: 24px; padding: 48px 40px; text-align: center; max-width: 360px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); } .icon { width: 80px; height: 80px; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; } .brand { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; } h1 { color: #1a1a2e; font-size: 24px; font-weight: 700; margin-bottom: 12px; } p { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 32px; } .btn { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; width: 100%; border: none; cursor: pointer; }</style></head><body><div class="card"><div class="brand">Tailora</div><div class="icon"><span style="font-size:40px">✅</span></div><h1>Payment Successful!</h1><p>Your order has been placed successfully. Go back to the app to view your order details.</p><button class="btn" onclick="window.history.back()">Back to Tailora</button></div></body></html>');
});

app.get('/cancel', (req, res) => {
  res.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Payment Cancelled</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; } .card { background: white; border-radius: 24px; padding: 48px 40px; text-align: center; max-width: 360px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.15); } .icon { width: 80px; height: 80px; background: #ffeaea; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; } .brand { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; } h1 { color: #1a1a2e; font-size: 24px; font-weight: 700; margin-bottom: 12px; } p { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 32px; } .btn { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; width: 100%; border: none; cursor: pointer; }</style></head><body><div class="card"><div class="brand">Tailora</div><div class="icon"><span style="font-size:40px">❌</span></div><h1>Payment Cancelled</h1><p>Your payment was cancelled. No charges were made. Go back and try again whenever you are ready.</p><button class="btn" onclick="window.history.back()">Back to Tailora</button></div></body></html>');
});

app.listen(3000, () => console.log('Server running'));
      
 
