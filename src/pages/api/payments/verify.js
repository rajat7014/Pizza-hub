// src/pages/api/payments/verify.js
import crypto from 'crypto'
import db from '@/utils/db'
import Payment from '@/models/Payment'
import Orders from '@/models/Orders'

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

    const { payment, paymentId } = req.body
    // payment should contain razorpay_payment_id, razorpay_order_id, razorpay_signature
    if (!payment || !paymentId) {
      return res
        .status(400)
        .json({ ok: false, error: 'Missing payment or paymentId' })
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
      .digest('hex')

    const paymentDoc = await Payment.findById(paymentId)
    if (!paymentDoc)
      return res
        .status(404)
        .json({ ok: false, error: 'Payment record not found' })

    if (generated_signature === payment.razorpay_signature) {
      // valid payment
      paymentDoc.razorpay_payment_id = payment.razorpay_payment_id
      paymentDoc.razorpay_signature = payment.razorpay_signature
      paymentDoc.status = 'paid'
      await paymentDoc.save()

      // Now create / save the order into Orders collection using the same shape as your ordersData API expects
      // Orders model in your project expects: { email: String, order_data: Array }
      const existing = await Orders.findOne({ email: paymentDoc.email })
      if (existing === null) {
        // create new Orders document
        await Orders.create({
          email: paymentDoc.email,
          order_data: paymentDoc.order_payload,
        })
      } else {
        // append new order payload to the start (your ordersData logic splices in date first)
        existing.order_data = [
          ...paymentDoc.order_payload,
          ...existing.order_data,
        ]
        await existing.save()
      }

      await db.disconnect()
      return res.status(200).json({ ok: true })
    } else {
      // signature mismatch
      paymentDoc.status = 'failed'
      await paymentDoc.save()

      await db.disconnect()
      return res.status(400).json({ ok: false, error: 'Invalid signature' })
    }
  } catch (err) {
    console.error('verify error:', err)
    try {
      await db.disconnect()
    } catch (e) {}
    return res.status(500).json({ ok: false, error: err.message })
  }
}
