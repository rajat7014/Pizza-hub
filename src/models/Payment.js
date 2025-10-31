// src/models/Payment.js
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: 'INR' },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    payment_mode: { type: String, default: 'Online' },
    status: { type: String, default: 'success' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    order_payload: { type: Array }, // the cart / order_data you currently pass to ordersData
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema)
export default Payment
