import useSWR from 'swr'
import axios from 'axios'

const fetcher = (url) => axios.get(url).then((r) => r.data)

export default function PersonalizedDashboard({ userId }) {
  const { data, error } = useSWR(
    () => (userId ? `/api/recs/${userId}` : null),
    fetcher,
    { refreshInterval: 60 * 1000 }
  )

  if (error)
    return (
      <div className='text-center text-red-400'>
        ⚠️ Error loading recommendations
      </div>
    )
  if (!data)
    return (
      <div className='text-center text-gray-400'>
        ⏳ Loading personalized dashboard...
      </div>
    )

  const recs = data.recs || []

  return (
    <div className='max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
      {recs.length > 0 ? (
        recs.map((r) => <Card key={r.id} widget={r.widget} score={r.score} />)
      ) : (
        <div className='col-span-full text-center text-gray-400'>
          No recommendations yet 🍕
        </div>
      )}
    </div>
  )
}

function Card({ widget, score }) {
  return (
    <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 border border-blue-400/20'>
      <div className='flex justify-between items-center mb-3'>
        <h3 className='text-xl font-semibold text-blue-300'>{widget.title}</h3>
        <span className='text-sm text-gray-400 bg-blue-600/20 px-2 py-1 rounded-md'>
          {widget.type}
        </span>
      </div>
      <p className='text-gray-300 text-sm mb-3'>{widget.content}</p>

      <div className='flex items-center justify-between'>
        <p className='text-blue-400 font-bold text-lg'>
          AI Score: {score.toFixed(1)}%
        </p>
        <button className='bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition'>
          Explore
        </button>
      </div>
    </div>
  )
}
