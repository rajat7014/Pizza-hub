// src/components/Recommendations.js
import React, { useEffect, useState } from 'react'

export default function Recommendations({ userId = 'guest' }) {
  const [recs, setRecs] = useState([])
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/recommendations?userId=${encodeURIComponent(userId)}`
        )
        const data = await res.json()
        setRecs(data.recommendations || [])
        setReason(data.reason || '')
      } catch (err) {
        console.error('Failed to load recs', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading) return <div className='p-4'>Loading recommendations…</div>
  if (!recs.length) return <div className='p-4'>No recommendations yet.</div>

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-semibold'>Recommended for you</h3>
        {reason && <span className='text-sm text-gray-500'>{reason}</span>}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {recs.map((r) => (
          <div key={r.id} className='bg-white rounded-xl shadow p-3 flex'>
            <img
              src={r.img || '/images/pizzas/placeholder.jpg'}
              alt={r.name}
              className='w-20 h-20 object-cover rounded-md mr-3'
            />
            <div className='flex-1'>
              <div className='font-semibold'>{r.name}</div>
              <div className='text-sm text-gray-500'>
                {r.type} • {r.flavor}
              </div>
              <div className='mt-2 flex items-center justify-between'>
                <div className='text-lg font-bold'>₹{r.price}</div>
                <button
                  onClick={() => {
                    // Add to cart — implement your cart logic here
                    alert(`Add ${r.name} to cart (implement cart logic).`)
                  }}
                  className='bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600'
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
