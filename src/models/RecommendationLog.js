import mongoose from 'mongoose'
const RecLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  served: [{ widgetId: mongoose.Schema.Types.ObjectId, score: Number }],
  model: String, // 'content-based','collab','hybrid','llm-rank'
  createdAt: { type: Date, default: Date.now },
})
export default mongoose.models.Interaction ||
  mongoose.model('RecommendationLog', RecLogSchema)
