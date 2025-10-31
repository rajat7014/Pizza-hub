import mongoose from 'mongoose'
const WidgetSchema = new mongoose.Schema({
  title: String,
  type: String, // 'shortcut','card','product','promo','tip'
  content: Object, // arbitrary payload for rendering
  tags: [String],
  priority: Number, // initial manual weight
  createdAt: { type: Date, default: Date.now },
  ownerId: mongoose.Schema.Types.ObjectId,
  city: String, // if localized content
})
export default mongoose.models.Interaction ||
  mongoose.model('Widget', WidgetSchema)
