// pizza-hub/server/socket-server.js
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  console.log('client connected', socket.id)

  socket.on('subscribeOrder', (orderId) => {
    console.log('subscribe:', orderId)
    socket.join(orderId)
  })

  socket.on('order:ping', ({ orderId }) => {
    io.to(orderId).emit('order:update', {
      orderId,
      status: 'Driver nearby',
      driver: {
        lat: 26.75 + Math.random() * 0.003,
        lng: 79.22 + Math.random() * 0.003,
        speedKmph: 28,
      },
      ts: new Date().toISOString(),
    })
  })

  socket.on('order:action', ({ orderId, action }) => {
    io.to(orderId).emit('order:update', {
      orderId,
      status: action,
      ts: new Date().toISOString(),
    })
  })
})

// Demo move: restaurant -> customer for DEMO123
const DEMO = 'DEMO123'
const rest = { lat: 26.75, lng: 79.22 }
const cust = { lat: 28.62, lng: 77.21 }
let t = 0
setInterval(() => {
  t = Math.min(1, t + 0.03)
  const lat = rest.lat + (cust.lat - rest.lat) * t
  const lng = rest.lng + (cust.lng - rest.lng) * t
  const status =
    t < 0.15
      ? 'Preparing'
      : t < 0.6
      ? 'En route'
      : t < 0.99
      ? 'Nearby'
      : 'Delivered'
  io.to(DEMO).emit('order:update', {
    orderId: DEMO,
    status,
    driver: { lat, lng, speedKmph: 30 },
    ts: new Date().toISOString(),
  })
  if (Math.random() < 0.2) {
    io.to(DEMO).emit('order:event', {
      orderId: DEMO,
      text: `Status: ${status}`,
      ts: new Date().toISOString(),
    })
  }
}, 4000)

const PORT = process.env.PORT || 1000
server.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
)

// Directions API route for accurate ETA
// app.post('/api/eta', async (req, res) => {
//   const { originLat, originLng, destLat, destLng } = req.body
//   const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

//   try {
//     const response = await axios.get(
//       `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${API_KEY}`
//     )
//     const duration = response.data.routes[0].legs[0].duration.value // in seconds
//     res.json({ duration })
//   } catch (err) {
//     console.log(err.message)
//     res.status(500).json({ error: 'Failed to fetch ETA' })
//   }
// })

// const PORT = 4000
// server.listen(PORT, () =>
//   console.log(`Socket server running on http://localhost:${PORT}`)
// )
