'use client'
import React, { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChatAssistant() {
  const [showPopup, setShowPopup] = useState(false)
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check login status using JWT token
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('userName')
    if (token) {
      setIsLoggedIn(true)
      setUserName(name || 'User')
    } else {
      setIsLoggedIn(false)
    }
  }, [])
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true)
      setTimeout(() => setShowWelcome(true))
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleChatClick = () => {
    if (!isLoggedIn) {
      router.push('/login') // redirect if not logged in
    } else {
      router.push('/chat') // go to chat page if logged in
    }
  }
  return (
    <>
      {/* Floating Assistant Button */}
      <div className='fixed bottom-6 right-6 flex flex-col items-center space-y-2 z-50'>
        {showPopup && showWelcome && !open && (
          <div className='bg-gray-900 text-white text-sm px-3 py-1 rounded-full shadow-md animate-bounce'>
            {showWelcome ? '💬 Your Assistant' : '👋 Welocme to Pizza Hub'}
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-4 rounded-full shadow-lg text-white transition-transform transform hover:scale-110'
        >
          {open ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chat Box */}
      {open && (
        <div className='fixed bottom-20 right-6 w-80 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 z-50'>
          <div className='flex justify-between items-center px-4 py-3 border-b border-gray-700'>
            <h2 className='text-lg font-semibold text-pink-500'>
              🍕 Pizza Hub Assistant
            </h2>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className='p-4 space-y-2 h-64 overflow-y-auto'>
            <p className='text-purple-400'>
              👋 Hi! I’m your Pizza Hub assistant. How can I help you today?
            </p>
          </div>

          <div className='px-4 py-2 border-t border-gray-700 text-center'>
            <button
              onClick={handleChatClick}
              className='text-blue-400 hover:underline text-sm'
            >
              Chat With Me
            </button>
          </div>
        </div>
      )}
    </>
  )
}
