// import { useState, useRef, useEffect } from 'react'

// export default function Chatbot() {
//   const [messages, setMessages] = useState([
//     {
//       role: 'assistant',
//       content: '👋 Hi! I’m your Pizza Hub assistant. How can I help you today?',
//     },
//   ])
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(false)
//   const bottomRef = useRef(null)

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const sendMessage = async () => {
//     if (!input.trim()) return

//     const userMessage = { role: 'user', content: input }
//     setMessages((prev) => [...prev, userMessage])
//     setInput('')
//     setLoading(true)

//     try {
//       const res = await fetch('/api/chatbot', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: input }),
//       })

//       const data = await res.json()

//       const botMessage = {
//         role: 'assistant',
//         content:
//           data.reply ||
//           '⚠️ Sorry, I couldn’t process your request right now. Please try again.',
//       }

//       setMessages((prev) => [...prev, botMessage])
//     } catch (error) {
//       console.error('Chatbot error:', error)
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: '⚠️ Server error. Please try again later.',
//         },
//       ])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !loading) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   return (
//     <div className='bg-gray-900 text-white rounded-2xl p-4 w-full max-w-md mx-auto shadow-lg border border-gray-700'>
//       <h2 className='text-xl font-semibold text-center text-blue-400 mb-3'>
//         🍕 Pizza Hub AI Chatbot
//       </h2>

//       <div className='h-80 overflow-y-auto space-y-2 p-2 bg-gray-800 rounded-lg border border-gray-700'>
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`p-2 rounded-lg ${
//               msg.role === 'user'
//                 ? 'text-right text-blue-100 bg-blue-600 ml-auto w-fit max-w-[80%]'
//                 : 'text-left text-blue-100 bg-gray-700 mr-auto w-fit max-w-[80%]'
//             }`}
//           >
//             {msg.content}
//           </div>
//         ))}
//         {loading && <div className='text-gray-400 italic'>Typing...</div>}
//         <div ref={bottomRef} />
//       </div>

//       <div className='mt-4 flex'>
//         <input
//           type='text'
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder='Ask something about pizzas...'
//           className='flex-grow p-2 rounded-l-md bg-gray-800 border border-gray-600 text-white focus:outline-none'
//           disabled={loading}
//         />
//         <button
//           onClick={sendMessage}
//           disabled={loading}
//           className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50'
//         >
//           {loading ? '...' : 'Send'}
//         </button>
//       </div>
//     </div>
//   )
// }

'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // 🧩 Load chat history or show welcome message
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // 👋 Default welcome message
      setMessages([
        {
          role: 'assistant',
          content:
            '👋 Hi! I’m your Pizza Hub assistant. How can I help you today?',
        },
      ])
    }
  }, [])

  // 💾 Save messages whenever chat updates
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

  // 📤 Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chatbot`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        }
      )

      const data = await response.json()

      if (data.reply) {
        const aiMessage = { role: 'assistant', content: data.reply }
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ⬇️ Scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='bg-gray-900 text-white rounded-2xl p-4 w-full max-w-md mx-auto shadow-lg border border-gray-700'>
      <h2 className='text-xl font-semibold text-center text-blue-400 mb-3'>
        🍕 Pizza Hub AI Chatbot
      </h2>

      <div className='h-80 overflow-y-auto space-y-2 p-2 bg-gray-800 rounded-lg border border-gray-700'>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg ${
              msg.role === 'user'
                ? 'text-right text-blue-100 bg-blue-600 ml-auto w-fit max-w-[80%]'
                : 'text-left text-blue-100 bg-gray-700 mr-auto w-fit max-w-[80%]'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className='text-gray-400 italic'>Typing...</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input & Send Button */}
      <div className='mt-4 flex'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder='Ask something about pizzas...'
          className='flex-grow p-2 rounded-l-md bg-gray-800 border border-gray-600 text-white focus:outline-none'
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50'
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>

      {/* 🧹 Clear Chat Button */}
      {messages.length > 1 && (
        <button
          onClick={() => {
            localStorage.removeItem('chatHistory')
            setMessages([
              {
                role: 'assistant',
                content:
                  '👋 Hi! I’m your Pizza Hub assistant. How can I help you today?',
              },
            ])
          }}
          className='mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded-lg'
        >
          Clear Chat
        </button>
      )}
    </div>
  )
}
