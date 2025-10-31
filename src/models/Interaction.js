import mongoose from 'mongoose'
const InteractionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  widgetId: mongoose.Schema.Types.ObjectId,
  action: String, // 'view', 'click', 'dismiss', 'complete'
  weight: Number, // e.g., view=1, click=5, dismiss=-5
  createdAt: { type: Date, default: Date.now },
  context: Object, // device, page, time-of-day
})
export default mongoose.models.Interaction ||
  mongoose.model('Interaction', InteractionSchema)
