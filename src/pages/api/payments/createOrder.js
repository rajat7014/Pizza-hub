// src/pages/api/payments/createOrder.js
import Razorpay from 'razorpay'
import db from '@/utils/db'
import Payment from '@/models/Orders'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })

  try {
    await db.connect()
    try {
      await Orders.collection.dropIndex('email_1')
      console.log('✅ Dropped old unique index on email')
    } catch (err) {
      if (err.code === 27) {
        console.log('✅ No old email_1 index found')
      } else {
        console.log('⚠️ dropIndex error:', err.message)
      }
    }
    const {
      amount,
      currency = 'INR',
      email,
      order_payload = [],
      order_date,
    } = req.body
    if (!amount || !email)
      return res
        .status(400)
        .json({ ok: false, error: 'Missing amount or email' })

    // Razorpay expects amount in paise
    const amountInPaise = Math.round(Number(amount) * 100)

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `pizzahub_rcpt_${Date.now()}`,
      payment_capture: 1, // auto-capture. set 0 if manual capture desired
    }

    const rOrder = await razorpay.orders.create(options)

    // create a Payment doc referencing this order
    const paymentDoc = await Payment.create({
      email,
      amount: amountInPaise,
      currency,
      razorpay_order_id: rOrder.id,
      status: 'pending',
      order_payload: [{ order_date }, ...order_payload], // keep shape like your current ordersData
    })

    await db.disconnect()

    return res.status(200).json({
      ok: true,
      razorpayOrder: rOrder,
      paymentId: paymentDoc._id,
    })
  } catch (err) {
    console.error('createOrder error:', err)
    try {
      await db.disconnect()
    } catch (e) {}
    return res.status(500).json({ ok: false, error: err.message })
  }
}
