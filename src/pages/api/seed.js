import db from '@/utils/db'
import PizzaData from '@/models/PizzaData'
import Widget from '@/models/Widget'

export default async function handler(req, res) {
  await db.connect()
  const sampleWidgets = [
    {
      title: 'Cheese Burst Pizza',
      content: 'Loaded with creamy cheese',
      type: 'pizza',
      tags: ['cheese', 'veg', 'special'],
      priority: 5,
    },
    {
      title: 'Peppy Paneer',
      content: 'Delicious paneer with fresh toppings',
      type: 'pizza',
      tags: ['paneer', 'veg'],
      priority: 4,
    },
    {
      title: 'Chicken BBQ',
      content: 'Spicy BBQ chicken pizza',
      type: 'pizza',
      tags: ['chicken', 'nonveg', 'spicy'],
      priority: 5,
    },
  ]
  await widget.deleteMany({})
  await Widget.insertMany(sampleWidgets)

  await PizzaData.updateMany({}, { $set: { priority: 3 } })
  await PizzaData.updateOne(
    { name: 'Veggie Paradise' },
    { $set: { priority: 5 } }
  )
  await PizzaData.updateOne({ name: 'Cheese Burst' }, { $set: { priority: 4 } })
  res.status(200).json({ message: 'Priority updated!' })
  res.status(200).json({ message: 'Widgets added successfully' })
  db.disconnect()
}
