// src/components/nav/DesktopNav.jsx
// Desktop navigation with dropdown menus

import React from 'react'
import NavDropdown from './NavDropdown.jsx'

export default function DesktopNav({ navSections }) {
  return (
    <nav className="hidden md:flex flex-wrap gap-2 text-xs md:text-sm">
      {navSections.map((section, idx) => (
        <NavDropdown
          key={idx}
          label={section.label}
          items={section.items}
          color={section.color}
        />
      ))}
    </nav>
  )
}
