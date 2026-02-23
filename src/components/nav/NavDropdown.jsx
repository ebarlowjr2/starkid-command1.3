// src/components/nav/NavDropdown.jsx
// Desktop dropdown navigation component

import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export default function NavDropdown({ label, items, color = 'cyan' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  
  // Check if any child route is active
  const isChildActive = items.some(item => 
    location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const colorClasses = {
    cyan: {
      active: 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30',
      inactive: 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10',
      dropdown: 'border-cyan-500/40 bg-zinc-900/95',
      itemHover: 'hover:bg-cyan-500/20'
    },
    purple: {
      active: 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-md shadow-purple-500/30',
      inactive: 'bg-black/40 border-purple-500/40 text-purple-300 hover:bg-purple-500/10',
      dropdown: 'border-purple-500/40 bg-zinc-900/95',
      itemHover: 'hover:bg-purple-500/20'
    },
    orange: {
      active: 'bg-orange-500/30 border-orange-400 text-orange-200 shadow-md shadow-orange-500/30',
      inactive: 'bg-black/40 border-orange-500/40 text-orange-300 hover:bg-orange-500/10',
      dropdown: 'border-orange-500/40 bg-zinc-900/95',
      itemHover: 'hover:bg-orange-500/20'
    },
    green: {
      active: 'bg-green-500/30 border-green-400 text-green-200 shadow-md shadow-green-500/30',
      inactive: 'bg-black/40 border-green-500/40 text-green-300 hover:bg-green-500/10',
      dropdown: 'border-green-500/40 bg-zinc-900/95',
      itemHover: 'hover:bg-green-500/20'
    }
  }

  const colors = colorClasses[color] || colorClasses.cyan

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded border transition-all flex items-center gap-1 ${
          isChildActive ? colors.active : colors.inactive
        }`}
      >
        {label}
        <svg 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute top-full left-0 mt-1 min-w-[180px] rounded border ${colors.dropdown} shadow-lg shadow-black/50 z-50`}
        >
          {items.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition-colors ${
                  isActive 
                    ? colors.active 
                    : `text-gray-300 ${colors.itemHover}`
                } ${idx === 0 ? 'rounded-t' : ''} ${idx === items.length - 1 ? 'rounded-b' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
