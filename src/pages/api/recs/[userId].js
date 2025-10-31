import mongoose from 'mongoose'
import Users from '@/models/Users'
import Widget from '../../../models/Widget'
import Interaction from '../../../models/Interaction'

function dot(a, b) {
  return a.reduce((s, _, i) => s + a[i] * b[i], 0)
}
function norm(a) {
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0))
}
function cosine(a, b) {
  const n1 = norm(a)
  const n2 = norm(b)
  if (!n1 || !n2) return 0
  return dot(a, b) / (n1 * n2)
}

export default async function handler(req, res) {
  const { userId } = req.query

  try {
    await mongoose.connect(process.env.DB_URL)

    const user = await Users.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const widgets = await Widget.find({}).lean()

    if (!widgets.length) {
      return res.status(200).json({ recs: [] })
    }

    // ✅ Build tag index dynamically
    const tagIndex = {}
    const allTags = [...new Set(widgets.flatMap((w) => w.tags || []))]
    allTags.forEach((tag, i) => (tagIndex[tag] = i))

    function tagsToVector(tags) {
      const v = new Array(Object.keys(tagIndex).length).fill(0)
      tags.forEach((t) => {
        if (tagIndex[t] !== undefined) v[tagIndex[t]] = 1
      })
      return v
    }

    const interactions = await Interaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean()

    // 🧩 If no interactions yet, fallback to popular widgets
    if (interactions.length === 0) {
      const topWidgets = widgets
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, 10)
      return res.status(200).json({
        recs: topWidgets.map((w) => ({
          id: w._id,
          score: w.priority || 0,
          widget: w,
        })),
      })
    }

    // Build weight map
    const wWeight = {}
    interactions.forEach((i) => {
      const id = i.widgetId.toString()
      wWeight[id] = (wWeight[id] || 0) + (i.weight || 1)
    })

    // Build vectors
    const widgetVectors = {}
    const popularity = {}
    widgets.forEach((w) => {
      widgetVectors[w._id] = tagsToVector(w.tags || [])
      popularity[w._id] = w.priority || 0
    })

    const agg = await Interaction.aggregate([
      { $group: { _id: '$widgetId', pop: { $sum: '$weight' } } },
    ])
    agg.forEach((a) => {
      popularity[a._id] = (popularity[a._id] || 0) + a.pop
    })

    const userVec = new Array(Object.keys(tagIndex).length).fill(0)
    Object.entries(wWeight).forEach(([wid, wgt]) => {
      const vec = widgetVectors[wid] || new Array(userVec.length).fill(0)
      for (let i = 0; i < userVec.length; i++) userVec[i] += vec[i] * wgt
    })

    const results = widgets.map((w) => {
      const wid = w._id.toString()
      const cSim = cosine(userVec, widgetVectors[wid] || [])
      const pop = popularity[wid] || 0
      const popScore = Math.log(1 + pop)
      const freshness =
        1 /
        (1 +
          (Date.now() - new Date(w.createdAt).getTime()) / (1000 * 3600 * 24))
      const tagMatch = cSim
      const score =
        0.25 * popScore +
        0.45 * tagMatch +
        0.1 * freshness +
        0.2 * (w.priority || 0)

      return { widget: w, score }
    })

    results.sort((a, b) => b.score - a.score)

    res.status(200).json({
      recs: results.slice(0, 20).map((r) => ({
        id: r.widget._id,
        score: r.score,
        widget: r.widget,
      })),
    })
  } catch (err) {
    console.error('Recommendation error:', err)
    res
      .status(500)
      .json({ error: 'Internal server error', details: err.message })
  }
}
