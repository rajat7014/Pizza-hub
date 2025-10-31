// pizza-hub/src/components/OrderTracker.jsx
import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api'
import dayjs from 'dayjs'

/*
 Props:
  - orderId (string)
  - restaurant { lat, lng }
  - customer { lat, lng }
  - socketUrl (string) -> optional (defaults to NEXT_PUBLIC_SOCKET_URL)
  - googleMapsApiKey (string) -> optional (defaults to NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
*/

const containerStyle = { width: '100%', height: '100%' }

function haversineKm(a, b) {
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const A =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A))
}

export default function OrderTracker({
  orderId,
  restaurant,
  customer,
  socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
  googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [driver, setDriver] = useState(null) // { lat, lng, speedKmph }
  const [status, setStatus] = useState('Pending')
  const [events, setEvents] = useState([]) // newest first
  const [etaSec, setEtaSec] = useState(null)
  const socketRef = useRef(null)
  const countdownRef = useRef(null)

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey })

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      if (orderId) socket.emit('subscribeOrder', orderId)
      pushEvent('Connected to tracking')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      pushEvent('Disconnected from tracking')
    })

    socket.on('order:update', (payload) => {
      if (!payload || payload.orderId !== orderId) return
      if (payload.status) setStatus(payload.status)
      if (payload.driver) setDriver(payload.driver)
      pushEvent(payload.status || 'Update', payload.ts)
    })

    socket.on('order:event', (payload) => {
      if (!payload || payload.orderId !== orderId) return
      pushEvent(payload.text || 'Event', payload.ts)
    })

    return () => {
      socket.disconnect()
      clearInterval(countdownRef.current)
    }
  }, [orderId, socketUrl])

  function pushEvent(text, ts = new Date().toISOString()) {
    setEvents((prev) => [{ text, ts }, ...prev].slice(0, 50))
  }

  useEffect(() => {
    if (!driver || !customer) {
      setEtaSec(null)
      return
    }
    const speed = driver.speedKmph || 30
    const distKm = haversineKm(driver, customer)
    const secs = Math.max(10, Math.round((distKm / Math.max(1, speed)) * 3600))
    setEtaSec(secs)

    clearInterval(countdownRef.current)
    let remaining = secs
    countdownRef.current = setInterval(() => {
      remaining -= 1
      setEtaSec(Math.max(0, remaining))
      if (remaining <= 0) clearInterval(countdownRef.current)
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [driver, customer])

  function formatDuration(s) {
    if (s == null) return '--'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h) return `${h}h ${m}m`
    if (m) return `${m}m ${sec}s`
    return `${sec}s`
  }

  const center = driver || restaurant || customer || { lat: 0, lng: 0 }

  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-3'>
      <div className='md:col-span-2 rounded-xl overflow-hidden h-80 md:h-[560px] bg-gray-50 shadow'>
        {!isLoaded ? (
          <div className='flex items-center justify-center h-full'>
            Loading map...
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
          >
            {restaurant && (
              <Marker
                position={{ lat: restaurant.lat, lng: restaurant.lng }}
                label='R'
              />
            )}
            {customer && (
              <Marker
                position={{ lat: customer.lat, lng: customer.lng }}
                label='C'
              />
            )}
            {driver && (
              <Marker
                position={{ lat: driver.lat, lng: driver.lng }}
                label='D'
              />
            )}
            {driver && customer && (
              <Polyline
                path={[
                  { lat: driver.lat, lng: driver.lng },
                  { lat: customer.lat, lng: customer.lng },
                ]}
                options={{ strokeWeight: 4, clickable: false }}
              />
            )}
          </GoogleMap>
        )}
      </div>

      <div className='flex flex-col gap-4'>
        <div className='p-4 bg-white rounded-xl shadow'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='text-lg font-semibold'>Order #{orderId || '—'}</h3>
              <p className='text-sm text-gray-500'>
                Status: <span className='font-medium'>{status}</span>
              </p>
            </div>
            <div className='text-right'>
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isConnected
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </div>
          </div>

          <div className='mt-4 flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-400'>Estimated arrival</p>
              <div className='text-2xl font-bold'>{formatDuration(etaSec)}</div>
              <div className='text-xs text-gray-500'>
                {driver
                  ? `${(haversineKm(driver, customer) || 0).toFixed(2)} km`
                  : ''}
              </div>
            </div>

            <div className='text-sm text-gray-500 text-right'>
              <p>
                Driver speed:{' '}
                {driver?.speedKmph ? `${driver.speedKmph} km/h` : '—'}
              </p>
              <p>
                Last update:{' '}
                {events[0]
                  ? dayjs(events[0].ts).format('YYYY-MM-DD HH:mm:ss')
                  : '--'}
              </p>
            </div>
          </div>
        </div>

        <div
          className='p-4 bg-white rounded-xl shadow overflow-auto'
          style={{ maxHeight: 320 }}
        >
          <h4 className='text-sm text-gray-400'>Activity timeline</h4>
          <ul className='space-y-3'>
            {events.length === 0 && (
              <li className='text-sm text-gray-500'>No events yet</li>
            )}
            {events.map((ev, idx) => (
              <li key={idx} className='flex gap-3 items-start'>
                <div className='w-3 h-3 rounded-full bg-indigo-400 mt-1.5' />
                <div>
                  <div className='text-sm text-gray-700'>{ev.text}</div>
                  <div className='text-xs text-gray-400'>
                    {dayjs(ev.ts).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className='p-4 bg-white rounded-xl shadow flex flex-col gap-2'>
          <div className='flex gap-2'>
            <button
              onClick={() => {
                socketRef.current?.emit('order:ping', { orderId })
                pushEvent('Manual ping')
              }}
              className='px-3 py-2 rounded bg-blue-600 text-white text-sm'
            >
              Ping driver
            </button>
            <button
              onClick={() => {
                socketRef.current?.emit('order:action', {
                  orderId,
                  action: 'delivered',
                })
                pushEvent('Marked delivered (manual)')
                setStatus('Delivered')
              }}
              className='px-3 py-2 rounded bg-green-600 text-white text-sm'
            >
              Mark delivered
            </button>
          </div>
          <div className='text-xs text-gray-500'>
            Remove debug controls in production and secure socket auth.
          </div>
        </div>
      </div>
    </div>
  )
}

//   const fetchEta = async () => {
//     try {
//       const res = await fetch('/api/eta', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           originLat: driver.lat,
//           originLng: driver.lng,
//           destLat: customer.lat,
//           destLng: customer.lng,
//         }),
//       })
//       const data = await res.json()
//       let secs = data.duration || 10
//       setEtaSec(secs)

//       clearInterval(countdownRef.current)
//       let remaining = secs
//       countdownRef.current = setInterval(() => {
//         remaining -= 1
//         setEtaSec(Math.max(0, remaining))
//         if (remaining <= 0) clearInterval(countdownRef.current)
//       }, 1000)
//     } catch (err) {
//       console.log('Failed to fetch ETA', err.message)
//     }
//   }
//   fetchEta()

//   return () => clearInterval(countdownRef.current)
// }, [driver, customer])
