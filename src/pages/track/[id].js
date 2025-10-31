// // pizza-hub/src/pages/track/[id].js
// import { useRouter } from 'next/router'
// import OrderTracker from '@/components/OrderTracker'

// export default function TrackPage() {
//   const router = useRouter()
//   const { id } = router.query

//   // For demo: static coords (replace with real order coordinates from your DB)
//   const restaurant = { lat: 28.6139, lng: 77.209 }
//   const customer = { lat: 28.62, lng: 77.21 }

//   return (
//     <div className='container mx-auto px-4 py-6'>
//       <h1 className='text-2xl font-bold mb-4'>Track Order {id || ''}</h1>
//       <OrderTracker
//         orderId={id || 'DEMO123'}
//         restaurant={restaurant}
//         customer={customer}
//       />
//     </div>
//   )
// }

// pizza - hub / src / pages / track / [id].js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OrderTracker from '@/components/OrderTracker'

export default function TrackPage() {
  const router = useRouter()
  const { id } = router.query

  // const [token, setToken] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null)

  useEffect(() => {
    // Get token
    // const t = localStorage.getItem("userToken");
    // setToken(t);

    // Get user's live location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setCustomerLocation({ lat: latitude, lng: longitude })
          console.log('📍 Your Location:', latitude, longitude)
        },
        (err) => {
          console.error('Geolocation error:', err)
          // fallback to default location
          setCustomerLocation({ lat: 26.752463, lng: 79.225416 })
        }
      )
    } else {
      console.error('Geolocation not supported')
      setCustomerLocation({ lat: 26.752463, lng: 79.225416 })
    }
  }, [])

  const restaurant = { lat: 26.75, lng: 79.22 } // you can change this to your pizza shop’s fixed location

  if (!customerLocation) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p>Detecting your location...</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <h1 className='text-2xl font-bold mb-4'>Track Order {id || ''}</h1>

      <OrderTracker
        orderId={id || 'DEMO123'}
        restaurant={restaurant}
        customer={customerLocation}
        socketUrl='http://localhost:4000'
      />
    </div>
  )
}

// /pages/track/[id].js
