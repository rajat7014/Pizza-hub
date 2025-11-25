import Orders from '@/models/Orders'
import db from '@/utils/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await db.connect()
    try {
      let data = await Orders.findOne({ email: req.body.email })
      res.json({ order_data: data })
    } catch (error) {
      res.send('Server error: ' + error.message)
    }
    await db.disconnect()
  }
}

// export default async function handler(req, res) {
//   try {
//     await db.connect()

//     if (req.method === 'POST') {
//       const { email } = req.body
//       if (!email) return res.status(400).json({ error: 'Email required' })

//       const order = await Orders.findOne({ email })
//       if (!order) return res.status(404).json({ error: 'No orders found' })

//       return res.status(200).json(order)
//     } else {
//       return res.status(405).json({ error: 'Method not allowed' })
//     }
//   } catch (error) {
//     console.error('MyOrdersData Error:', error)
//     return res.status(500).json({ error: 'Internal server error' })
//   } finally {
//     await db.disconnect()
//   }
// }
