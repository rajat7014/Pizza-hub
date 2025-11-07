import Orders from '@/models/Orders'
import db from '@/utils/db'

export default async function handler(req, res) {
  try {
    await db.connect()

    if (req.method === 'POST') {
      const { email, order_data, order_date } = req.body

      if (!email || !order_data)
        return res.status(400).json({ error: 'Missing fields' })

      const existingOrder = await Orders.findOne({ email })

      if (existingOrder) {
        await Orders.findOneAndUpdate(
          { email },
          {
            $push: {
              order_data: { $each: order_data, $position: 0 },
              order_date,
            },
          }
        )
      } else {
        await Orders.create({ email, order_data: [order_data], order_date })
      }

      return res.status(200).json({ success: true })
    } else if (req.method === 'GET') {
      const allOrders = await Orders.find({})
      return res.status(200).json(allOrders)
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('OrdersData Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await db.disconnect()
  }
}
