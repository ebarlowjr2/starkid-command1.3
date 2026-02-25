// src/components/nav/MobileNav.jsx
// Mobile hamburger menu with accordion sections

import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function AccordionSection({ label, items, color = 'cyan', isOpen, onToggle }) {
  const location = useLocation()
  
  const isChildActive = items.some(item => 
    location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  )

  const colorClasses = {
    cyan: {
      header: isChildActive ? 'text-cyan-300 border-cyan-400' : 'text-cyan-400 border-cyan-500/40',
      item: 'text-cyan-300 hover:bg-cyan-500/20',
      activeItem: 'bg-cyan-500/30 text-cyan-200'
    },
    purple: {
      header: isChildActive ? 'text-purple-300 border-purple-400' : 'text-purple-400 border-purple-500/40',
      item: 'text-purple-300 hover:bg-purple-500/20',
      activeItem: 'bg-purple-500/30 text-purple-200'
    },
    orange: {
      header: isChildActive ? 'text-orange-300 border-orange-400' : 'text-orange-400 border-orange-500/40',
      item: 'text-orange-300 hover:bg-orange-500/20',
      activeItem: 'bg-orange-500/30 text-orange-200'
    },
    green: {
      header: isChildActive ? 'text-green-300 border-green-400' : 'text-green-400 border-green-500/40',
      item: 'text-green-300 hover:bg-green-500/20',
      activeItem: 'bg-green-500/30 text-green-200'
    }
  }

  const colors = colorClasses[color] || colorClasses.cyan

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between ${colors.header} transition-colors`}
      >
        <span className="font-semibold tracking-wide">{label}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="py-1 bg-black/30">
          {items.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) =>
                `block px-6 py-2 text-sm transition-colors ${
                  isActive ? colors.activeItem : colors.item
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MobileNav({ navSections }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState(null)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 text-cyan-300 hover:text-cyan-200 transition-colors"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-zinc-900 border-l border-cyan-500/30 z-50 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu header */}
        <div className="p-4 border-b border-cyan-500/30 flex items-center justify-between">
          <span className="text-cyan-300 font-semibold">NAVIGATION</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1 text-cyan-300 hover:text-cyan-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu sections */}
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {navSections.map((section, idx) => (
            <AccordionSection
              key={idx}
              label={section.label}
              items={section.items}
              color={section.color}
              isOpen={openSection === idx}
              onToggle={() => setOpenSection(openSection === idx ? null : idx)}
            />
          ))}
          
          {/* Home link at bottom */}
          <div className="p-4 border-t border-zinc-800">
            <NavLink
              to="/"
              className="block text-center py-2 text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              Home
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}
