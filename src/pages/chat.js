// pages/chat.js
import React from 'react'
import ChatBot from '../components/ChatBot'

export default function ChatPage() {
  return (
    <div
      className='min-h-screen flex items-center justify-center bg-cover bg-center relative'
      style={{
        backgroundImage: "url('/pizza-bg.png')",
      }}
    >
      <div className='absolute inset-0 bg-black bg-opacity-60' />
      <div className='relative z-10 w-full max-w-2xl p-4'>
        <ChatBot />
      </div>
    </div>
  )
}
