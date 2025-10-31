// import db from '@/utils/db'
// import Payment from '@/models/Orders'

// export default async function handler(req, res) {
//   if (req.method !== 'POST')
//     return res.status(405).json({ error: 'Method not allowed' })

//   try {
//     await db.connect()

//     const { email, amount, order_payload, payment_mode, order_date } = req.body

//     const payment = await Payment.create({
//       email,
//       amount,
//       items: order_payload,
//       payment_mode: payment_mode || 'COD',
//       status: 'pending', // since COD payment not yet made
//       order_date,
//     })

//     await db.disconnect()

//     res.status(200).json({
//       success: true,
//       message: 'COD order placed successfully',
//       payment,
//     })
//   } catch (err) {
//     console.error('COD order error:', err)
//     res.status(500).json({ error: 'Server error creating COD order' })
//   }
// }

import db from '@/utils/db'
import Payment from '@/models/Payment'
import Orders from '@/models/Orders'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

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

    const { email, amount, order_payload } = req.body

    // 🧩 Step 1: Save Payment record for tracking
    await Payment.create({
      email,
      amount,
      payment_mode: 'COD',
      status: 'pending',
      order_payload,
    })

    // 🕓 Step 2: Prepare the order data in same structure as your MyOrders page expects
    const today = new Date().toDateString()
    const newOrderBlock = [{ Order_date: today }, ...order_payload]

    // 🧩 Step 3: Update or create Orders entry
    const existing = await Orders.findOne({ email })

    if (!existing) {
      // new customer — create a new document
      await Orders.create({
        email,
        order_data: [newOrderBlock],
      })
    } else {
      // returning customer — prepend new order block to existing orders
      existing.order_data = [newOrderBlock, ...existing.order_data]
      await existing.save()
    }

    await db.disconnect()
    return res
      .status(200)
      .json({ ok: true, message: 'COD order placed successfully' })
  } catch (err) {
    console.error('Error creating COD order:', err)
    await db.disconnect()
    return res.status(500).json({ ok: false, error: err.message })
  }
}
