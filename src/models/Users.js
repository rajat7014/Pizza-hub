// import mongoose from 'mongoose'

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     location: { type: String, required: true },
//     isAdmin: { type: Boolean, default: false },

//     // NEW: wallet & rewards
//     walletBalance: { type: Number, default: 0 }, // rupees
//     rewardPoints: { type: Number, default: 0 }, // points (convert to currency if needed)

//     date: {
//       type: Date,
//       default: Date.now,
//     },
//   },

//   { timestamps: true }
// )

// const Users = mongoose.models.Users || mongoose.model('Users', userSchema)

// export default Users

// models/Users.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    // 🧍 Basic user info (your existing fields)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },

    // 💰 Wallet & rewards (from your Pizza Hub project)
    walletBalance: { type: Number, default: 0 }, // rupees
    rewardPoints: { type: Number, default: 0 }, // points (convert to currency if needed)

    // 🕒 Signup date
    date: { type: Date, default: Date.now },

    // 🧠 --- AI Personalization fields (merged from your new AI schema) ---
    city: { type: String }, // helps with location-based recommendations

    preferences: {
      // explicit preferences for AI dashboard
      categories: { type: [String], default: [] }, // e.g., "Pizza", "Drinks"
      disliked: { type: [String], default: [] }, // e.g., "Spicy", "Cheese"
    },

    metadata: {
      // stores extra data for AI personalization
      device: { type: String, default: null }, // e.g., "mobile", "desktop"
      plan: { type: String, default: null }, // e.g., "premium", "free"
      role: { type: String, default: null }, // e.g., "user", "admin"
    },

    // AI system reference fields (optional, for recommendation logging)
    signupAt: { type: Date, default: Date.now }, // used in AI tracking
  },
  { timestamps: true }
)

// ✅ Prevent model overwrite during dev (Next.js hot reload fix)
const Users = mongoose.models.Users || mongoose.model('Users', userSchema)

export default Users
