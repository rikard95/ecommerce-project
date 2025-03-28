import dotenv from "dotenv";
import express from "express";  
import { connectDB } from "./config/db";

const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(express.json())
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PATCH", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



app.post('/stripe/create-checkout-session', async (req, res) => {
  try {
    const { cart, customerId, orderId } = req.body;

    const lineItems = cart.map(item => ({

      price_data: {
        currency: 'sek',
        product_data: {
          name: item.product.name,
          images:[item.product.image],
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    }));

   
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:5173/checkout',
      client_reference_id: orderId
    });

    await updateOrderWithSessionId(orderId, session.id, 'unpaid');

    res.json({ checkout_url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

async function updateOrderWithSessionId(orderId, sessionId, paymentStatus) {
  try {
    const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        payment_id: sessionId,
        payment_status: paymentStatus, 
        order_status: 'pending' }), 
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to update order with session_id:", data);
    }
  } catch (error) {
    console.error("Error updating order with session_id:", error);
  }
}

app.get('/stripe/session/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(session);
    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: `Failed to retrieve Stripe session: ${error.message}` });
  }
});




// Routes
import productRouter from "./routes/products";
import customerRouter from "./routes/customers";
import orderRouter from "./routes/orders";
import orderItemRouter from "./routes/orderItems";
app.use('/products', productRouter)
app.use('/customers', customerRouter)
app.use('/orders', orderRouter)
app.use('/order-items', orderItemRouter)


connectDB()


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`The server is running at http://localhost:${PORT}`);
})

