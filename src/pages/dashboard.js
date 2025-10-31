// 'use client'
// import { useEffect, useState } from 'react'
// import PersonalizedDashboard from '@/components/PersonalizedDashboard'
// import { jwtDecode } from 'jwt-decode'
// import { useRouter } from 'next/navigation'
// import axios from 'axios'
// export default function DashboardPage() {
//   const [userId, setUserId] = useState(null)
//   const [user, setUser] = useState({})
//   const router = useRouter()

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem('token')
//         if (!token) {
//           console.warn('No token found, redirecting to login...')
//           router.push('/login')
//           return
//         }

//         const decoded = jwtDecode(token)

//         // ✅ Since your JWT structure is: { user: { id: "..." } }
//         if (decoded?.user?.id) {
//           const id = decoded.user.id
//           setUserId(id)

//           // ✅ Fetch user details from backend
//           //   const res = await axios.post(`/api/getDataById?id=${id}`)
//           //   if (res.data?.user) setUser(res.data.user)
//           // ✅ Fetch user details from backend
//           const res = await axios.post('/api/getDataById', { item: id })
//           if (res.data?.data) setUser(res.data.data)
//         } else {
//           console.warn('Invalid token format.')
//           router.push('/login')
//         }
//       } catch (err) {
//         console.error('Error decoding token:', err)
//         router.push('/login')
//       }
//     }

//     fetchUser()
//   }, [router])

//   return (
//     <div className='min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] text-white px-6 py-10'>
//       <h1 className='text-4xl font-extrabold text-center mb-8 text-blue-400'>
//         🧠 Personalized Dashboard
//       </h1>

//       {!userId || !user ? (
//         <div className='text-center mt-20 text-gray-400 text-lg animate-pulse'>
//           Loading your personalized experience...
//         </div>
//       ) : (
//         <div>
//           {/* 🧍 User Profile Section */}
//           <div className='text-center mb-8 bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-blue-700'>
//             <h2 className='text-2xl font-semibold text-blue-300'>
//               Welcome, {user.email} 👋
//             </h2>
//             <p className='text-gray-400 mt-2 text-sm'>User ID: {userId}</p>

//             <div className='flex justify-center gap-6 mt-4'>
//               <div className='bg-blue-900/40 p-3 rounded-lg'>
//                 💰 <span className='font-semibold'>{user.walletBalance}</span>{' '}
//                 Wallet
//               </div>
//               <div className='bg-blue-900/40 p-3 rounded-lg'>
//                 ⭐ <span className='font-semibold'>{user.rewardPoints}</span>{' '}
//                 Points
//               </div>
//             </div>
//           </div>

//           {/* 🎯 Recommendations Section */}
//           <div className='bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-blue-800'>
//             <PersonalizedDashboard userId={userId} />
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'
import { useEffect, useState } from 'react'
import PersonalizedDashboard from '@/components/PersonalizedDashboard'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import axios from 'axios'
// import RecommendationList from '@/components/RecommendationList'
// import Recommendations from '@/components/Recommendations'

export default function DashboardPage() {
  const [userId, setUserId] = useState(null)
  const [user, setUser] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('No token found, redirecting to login...')
          router.push('/login')
          return
        }

        const decoded = jwtDecode(token)
        if (decoded?.user?.id) {
          const id = decoded.user.id
          setUserId(id)

          // ✅ Use POST to match backend
          const res = await axios.post('/api/getDataById', { item: id })
          if (res.data?.user) {
            setUser(res.data.user)
          } else {
            console.warn('User data not found in API response.')
          }
        } else {
          console.warn('Invalid token format.')
          router.push('/login')
        }
      } catch (err) {
        console.error('Error decoding token:', err)
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  // While loading
  if (!user) {
    return (
      <div className='p-6 text-center'>
        <h2 className='text-xl text-gray-600'>Loading your dashboard...</h2>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] text-white px-6 py-10'>
      <h1 className='text-4xl font-extrabold text-center mb-8 text-blue-400'>
        🧠 Personalized Dashboard
      </h1>

      {!userId || !user ? (
        <div className='text-center mt-20 text-gray-400 text-lg animate-pulse'>
          Loading your personalized experience...
        </div>
      ) : (
        <div>
          {/* 🧍 User Profile Section */}
          <div className='text-center mb-8 bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-blue-700'>
            <h2 className='text-2xl font-semibold text-blue-300'>
              Welcome, {user.email} 👋
            </h2>
            <p className='text-gray-400 mt-2 text-sm'>User ID: {userId}</p>

            <div className='flex justify-center gap-6 mt-4'>
              <div className='bg-blue-900/40 p-3 rounded-lg'>
                💰 <span className='font-semibold'>{user.walletBalance}</span>{' '}
                Wallet
              </div>
              <div className='bg-blue-900/40 p-3 rounded-lg'>
                ⭐ <span className='font-semibold'>{user.rewardPoints}</span>{' '}
                Points
              </div>
            </div>
          </div>

          {/* 🎯 Recommendations Section */}
          <div className='bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-blue-800'>
            <h3 className='text-2xl font-semibold mb-6 text-blue-300'>
              🍕 Recommended For You
            </h3>
            <div className='bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-blue-800'>
              <PersonalizedDashboard userId={userId} user={user} />
              {/* <RecommendationList recommendations={recommendations} /> */}
              {/* <Recommendations userId={userId} user={user} /> */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
