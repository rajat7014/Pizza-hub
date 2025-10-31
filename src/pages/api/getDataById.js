// import PizzaData from "@/models/PizzaData";
// import db from "@/utils/db";
// import Users from '@/models/Users'

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     await db.connect();
//     let data = await PizzaData.findById(req.body.item);
//     res.status(200).json({ data });
//   }
//   db.disconnect();
// }

import PizzaData from '@/models/PizzaData'
import db from '@/utils/db'
import Users from '@/models/Users'

export default async function handler(req, res) {
  await db.connect()

  try {
    if (req.method === 'POST') {
      const { item } = req.body

      // Try to find in PizzaData first
      let data = await PizzaData.findById(item)

      // If not found in PizzaData, maybe it's a User ID
      if (!data) {
        const user = await Users.findById(item).select('email _id')
        if (!user) {
          return res.status(400).json({ error: 'No data found for this ID' })
        }
        return res.status(200).json({ user })
      }

      res.status(200).json({ data })
    } else {
      res.status(400).json({ error: 'Invalid request method' })
    }
  } catch (err) {
    console.error('Error in getDataById API:', err)
    res.status(500).json({ error: 'Server error' })
  } finally {
    db.disconnect()
  }
}
