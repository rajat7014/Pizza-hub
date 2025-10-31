import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    order_data: {
      type: Array,
      required: true,
    },
  },

  { timestamps: true }
)

const Orders = mongoose.models.Orders || mongoose.model('Orders', orderSchema)

export default Orders
