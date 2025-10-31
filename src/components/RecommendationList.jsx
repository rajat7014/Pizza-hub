'use client'
import React from 'react'
import cardData from '@/store/cardData.json'
import { useRouter } from 'next/navigation'

export default function RecommendationList({ recommendations }) {
  const router = useRouter()

  // Match recommended widget IDs with pizzas from cardData.json
  const recommendedPizzas = recommendations
    ?.map((r) => cardData.find((pizza) => pizza.id === r.widget?._id || r.id))
    .filter(Boolean)

  if (!recommendedPizzas?.length) {
    return (
      <p className='text-gray-400 text-center py-6'>
        🍕 No pizza recommendations yet. Try exploring the menu!
      </p>
    )
  }

  return (
    <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6'>
      {recommendedPizzas.map((pizza) => (
        <div
          key={pizza.id}
          className='bg-[#1e293b] rounded-2xl p-4 shadow-lg border border-blue-800 hover:scale-105 transition-all duration-300'
        >
          <img
            src={pizza.img}
            alt={pizza.name}
            className='rounded-xl w-full h-40 object-cover mb-4'
          />
          <h3 className='text-xl font-semibold text-blue-300'>{pizza.name}</h3>
          <p className='text-gray-400 text-sm mt-1 line-clamp-2'>
            {pizza.description}
          </p>

          <div className='mt-4 flex justify-between items-center'>
            <span className='text-blue-400 font-bold'>
              ₹{pizza.price.medium}
            </span>
            <button
              onClick={() => router.push(`/pizza/${pizza.id}`)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm'
            >
              Explore
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
