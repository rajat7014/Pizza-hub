'use client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Home,
  ShoppingCart,
  Heart,
  User,
  Settings,
  LogOut,
} from 'lucide-react'

export default function SidebarDrawer({ open, setOpen }) {
  const menuItems = [
    { label: 'Profile', icon: <User size={20} />, href: '/dashboard' },
    { label: 'Orders', icon: <ShoppingCart size={20} />, href: '/orders' },
    { label: 'Favorites', icon: <Heart size={20} />, href: '/favorites' },
    // { label: 'Profile', icon: <User size={20} />, href: '/profile' },
    { label: 'Settings', icon: <Settings size={20} />, href: '/settings' },
    // { label: 'Logout', icon: <LogOut size={20} />, href: '/login'  },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 z-40'
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar panel */}
          <motion.div
            className='fixed top-0 right-0 w-72 h-full bg-gradient-to-r from-black via-violet-700 to-black shadow-lg z-50 p-5'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Close button */}
            <div className='flex justify-end mb-6'>
              <button onClick={() => setOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className='space-y-5'>
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className='flex items-center gap-3 text-lg hover:text-red-500 transition'
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
