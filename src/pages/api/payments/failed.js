// /src/pages/payment/failed.js
import Link from 'next/link'

export default function Failed() {
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-red-50 text-center'>
      <div className='text-5xl font-bold text-red-600 mb-4'>
        ❌ Payment Failed!
      </div>
      <p className='text-xl text-gray-700 mb-4'>
        Something went wrong during the payment process.
      </p>
      <Link
        href='/cart'
        className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
      >
        Try Again
      </Link>
    </div>
  )
}
