// /src/pages/payment/success.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Success() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/myOrders')
    }, 3000) // Redirect after 3 seconds
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-green-50 text-center'>
      <div className='text-5xl font-bold text-green-600 mb-4'>
        ✅ Payment Successful!
      </div>
      <p className='text-xl text-gray-700'>
        Thank you for your order. Redirecting to My Orders...
      </p>
    </div>
  )
}
