// src/pages/api/recommendations.js
import mongoose from 'mongoose'

// --- MongoDB helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return
  await mongoose.connect(process.env.MONGODB_URI, {
    // optional settings
  })
}

// --- Chat model (if you already have a model elsewhere, you can import instead)
const ChatSchema = new mongoose.Schema({
  sender: String, // 'user'|'bot'
  message: String,
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, default: 'guest' },
})
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema)

// --- Order model (optional — if you have orders table, recommends from it)
const OrderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
      category: String, // e.g., 'veg'|'non-veg'
    },
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now },
})
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

// --- Local pizza catalog (use your real DB/catalog in production)
const pizzas = [
  {
    id: 'marg',
    name: 'Margherita Pizza',
    price: 149,
    type: 'veg',
    flavor: 'cheesy',
    img: '/images/pizzas/margherita.jpg',
  },
  {
    id: 'paneer',
    name: 'Paneer Tikka Pizza',
    price: 199,
    type: 'veg',
    flavor: 'spicy',
    img: '/images/pizzas/paneer.jpg',
  },
  {
    id: 'chicken',
    name: 'Chicken Delight',
    price: 249,
    type: 'non-veg',
    flavor: 'cheesy',
    img: '/images/pizzas/chicken.jpg',
  },
  {
    id: 'mex',
    name: 'Mexican Hot Pizza',
    price: 299,
    type: 'veg',
    flavor: 'spicy',
    img: '/images/pizzas/mexican.jpg',
  },
  {
    id: 'cheeseburst',
    name: 'Cheese Burst Pizza',
    price: 179,
    type: 'veg',
    flavor: 'cheesy',
    img: '/images/pizzas/cheeseburst.jpg',
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni Pizza',
    price: 249,
    type: 'non-veg',
    flavor: 'spicy',
    img: '/images/pizzas/pepperoni.jpg',
  },
]

// --- utility: extract simple signals from text messages
function extractSignalsFromText(text) {
  const t = (text || '').toLowerCase()
  const signals = {
    wantsSpicy: /spicy|hot|pepper|peri/i.test(t),
    wantsCheesy: /cheese|cheesy|cheese burst|mozzarella/i.test(t),
    wantsVeg: /veg|vegetarian|vegetable|paneer|corn/i.test(t),
    wantsNonVeg: /non-veg|nonveg|chicken|pepperoni|mutton|beef|prawn/i.test(t),
    priceMention: null, // number
  }
  const prices = t.match(/\b\d{2,5}\b/g) // find numbers like 100, 200
  if (prices && prices.length) {
    // pick the most relevant: if phrase uses "under 200" we want 200, else take max
    signals.priceMention = Math.max(...prices.map(Number))
  }
  return signals
}

// --- scoring function
function scorePizzas(signals, orderSummary = {}) {
  const scores = pizzas.map((p) => {
    let score = 0

    // price preference
    if (signals.priceMention) {
      if (p.price <= signals.priceMention) score += 2
    } else {
      // prefer mid-range
      if (p.price <= 200) score += 1
    }

    // flavor/type matches
    if (signals.wantsSpicy && p.flavor === 'spicy') score += 3
    if (signals.wantsCheesy && p.flavor === 'cheesy') score += 3
    if (signals.wantsVeg && p.type === 'veg') score += 2
    if (signals.wantsNonVeg && p.type === 'non-veg') score += 2

    // order history boost (if user ordered same flavor/type before)
    if (
      orderSummary.mostOrderedFlavor &&
      p.flavor === orderSummary.mostOrderedFlavor
    )
      score += 2
    if (orderSummary.mostOrderedType && p.type === orderSummary.mostOrderedType)
      score += 2

    // small boost for popular defaults (could be replaced by popularity data)
    if (['Margherita Pizza', 'Cheese Burst Pizza'].includes(p.name)) score += 1

    return { pizza: p, score }
  })

  // sort descending by score then price ascending
  scores.sort((a, b) => b.score - a.score || a.pizza.price - b.pizza.price)
  return scores
}

// --- API handler
export default async function handler(req, res) {
  try {
    // userId passed in query (GET) or body (POST). Default to 'guest'
    const userId =
      (req.method === 'GET' ? req.query.userId : req.body.userId) || 'guest'
    await connectDB()

    // Get recent chats for user
    const recentChats = await Chat.find({ userId })
      .sort({ timestamp: -1 })
      .limit(30)
      .lean()
      .exec()

    // Get recent orders if present (optional)
    const recentOrders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec()

    // Aggregate order summary
    const orderSummary = {
      flavorCounts: {},
      typeCounts: {},
      mostOrderedFlavor: null,
      mostOrderedType: null,
    }
    recentOrders.forEach((order) => {
      ;(order.items || []).forEach((it) => {
        const flavor = (it.flavor || '').toLowerCase() // if your orders include flavor
        const type = (it.category || it.type || '').toLowerCase()
        if (flavor)
          orderSummary.flavorCounts[flavor] =
            (orderSummary.flavorCounts[flavor] || 0) + (it.qty || 1)
        if (type)
          orderSummary.typeCounts[type] =
            (orderSummary.typeCounts[type] || 0) + (it.qty || 1)
      })
    })
    // compute most ordered
    const mostFlavor = Object.entries(orderSummary.flavorCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]
    const mostType = Object.entries(orderSummary.typeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]
    if (mostFlavor) orderSummary.mostOrderedFlavor = mostFlavor[0]
    if (mostType) orderSummary.mostOrderedType = mostType[0]

    // Extract signals from chat text (combine recent messages)
    const combinedText = recentChats.map((c) => c.message).join(' ')
    const signals = extractSignalsFromText(combinedText)

    // If no recent chat signals, check the last user message (if exists)
    if (
      !signals.wantsCheesy &&
      !signals.wantsSpicy &&
      !signals.wantsVeg &&
      !signals.wantsNonVeg &&
      !signals.priceMention &&
      recentChats.length
    ) {
      const last = recentChats[0].message
      Object.assign(signals, extractSignalsFromText(last))
    }

    // Score pizzas
    const scored = scorePizzas(signals, orderSummary)

    // Pick top 4 recommendations
    const top = scored.slice(0, 4).map((s) => ({
      id: s.pizza.id,
      name: s.pizza.name,
      price: s.pizza.price,
      type: s.pizza.type,
      flavor: s.pizza.flavor,
      img: s.pizza.img,
      score: s.score,
    }))

    // If no chats/orders exist and no signal, return default top picks
    if (
      recentChats.length === 0 &&
      recentOrders.length === 0 &&
      (!signals || Object.keys(signals).length === 0)
    ) {
      // default picks
      const defaults = pizzas
        .slice(0, 4)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          img: p.img,
          type: p.type,
          flavor: p.flavor,
        }))
      return res
        .status(200)
        .json({ recommendations: defaults, reason: 'top picks' })
    }

    // Build explanation text (optional)
    const reasonParts = []
    if (signals.wantsSpicy) reasonParts.push('you asked for spicy')
    if (signals.wantsCheesy) reasonParts.push('you asked for cheesy')
    if (signals.wantsVeg) reasonParts.push('you asked for veg')
    if (signals.priceMention)
      reasonParts.push(`budget ₹${signals.priceMention}`)
    if (orderSummary.mostOrderedFlavor)
      reasonParts.push(
        `because you ordered ${orderSummary.mostOrderedFlavor} before`
      )
    const reason = reasonParts.length
      ? `Recommendations based on ${reasonParts.join(', ')}`
      : 'Personalized picks'

    return res.status(200).json({ recommendations: top, reason })
  } catch (err) {
    console.error('Recommendation error', err)
    return res.status(500).json({ error: 'Failed to compute recommendations' })
  }
}
