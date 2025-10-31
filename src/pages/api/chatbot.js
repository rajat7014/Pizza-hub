import mongoose from 'mongoose'

// ✅ Define MongoDB Schema and Model
const ChatSchema = new mongoose.Schema({
  sender: String, // 'user' or 'bot'
  message: String,
  timestamp: { type: Date, default: Date.now },
})

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema)

// ✅ MongoDB connection helper
const db = async () => {
  if (mongoose.connection.readyState >= 1) return
  await mongoose.connect(process.env.MONGODB_URI)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = req.body
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: 'Missing GEMINI_API_KEY in environment' })
    }

    // ✅ Connect to MongoDB
    await db()

    // ✅ Save user message
    await Chat.create({ sender: 'user', message })

    // 🍕 Local Pizza Database (For Recommendation)
    const pizzas = [
      { name: 'Margherita Pizza', price: 149, type: 'veg', flavor: 'cheesy' },
      { name: 'Paneer Tikka Pizza', price: 199, type: 'veg', flavor: 'spicy' },
      {
        name: 'Chicken Delight',
        price: 249,
        type: 'non-veg',
        flavor: 'cheesy',
      },
      { name: 'Mexican Hot Pizza', price: 299, type: 'veg', flavor: 'spicy' },
      { name: 'Cheese Burst Pizza', price: 179, type: 'veg', flavor: 'cheesy' },
      { name: 'Pepperoni Pizza', price: 249, type: 'non-veg', flavor: 'spicy' },
    ]

    const lowerMsg = message.toLowerCase()
    let reply = ''

    // 🍕 Check if user wants pizza suggestions
    if (
      lowerMsg.includes('recommend') ||
      lowerMsg.includes('suggest') ||
      lowerMsg.includes('best') ||
      lowerMsg.includes('under') ||
      lowerMsg.includes('between')
    ) {
      const priceMatch = lowerMsg.match(/\d+/g)
      const maxPrice = priceMatch ? Math.max(...priceMatch.map(Number)) : 1000
      const isSpicy = lowerMsg.includes('spicy')
      const isCheesy =
        lowerMsg.includes('cheese') || lowerMsg.includes('cheesy')
      const isVeg = lowerMsg.includes('veg')

      let filtered = pizzas.filter((p) => p.price <= maxPrice)
      if (isSpicy) filtered = filtered.filter((p) => p.flavor === 'spicy')
      if (isCheesy) filtered = filtered.filter((p) => p.flavor === 'cheesy')
      if (isVeg) filtered = filtered.filter((p) => p.type === 'veg')

      if (filtered.length > 0) {
        reply = `🔥 Here are some pizzas you might like:\n${filtered
          .map((p) => `🍕 ${p.name} — ₹${p.price}`)
          .join('\n')}`
      } else {
        reply = "😅 Sorry, I couldn't find pizzas matching your request."
      }
    } else {
      // 🤖 If not pizza-related, use Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: message || 'Hello!' }],
              },
            ],
          }),
        }
      )

      const dataText = await response.text()
      let data = {}

      try {
        data = JSON.parse(dataText)
      } catch {
        console.error('Invalid JSON from Gemini:', dataText)
        return res
          .status(500)
          .json({ error: 'Invalid response from Gemini API' })
      }

      if (!response.ok) {
        console.error('Gemini API Error:', data)
        return res.status(500).json({ error: data })
      }

      reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Sorry, I couldn’t process your request right now.'
    }

    // ✅ Save AI reply
    await Chat.create({ sender: 'bot', message: reply })

    res.status(200).json({ reply })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
