import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

export const NavBar: React.FC = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md text-sm font-medium min-h-[44px] flex items-center ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
    }`

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/create', label: t('nav.create') },
    { to: '/mint', label: t('nav.mint') },
    { to: '/burn', label: t('nav.burn') },
    { to: '/tokens', label: t('nav.tokens') },
  ]

  return (
    <nav aria-label={t('nav.ariaLabel')} className="mt-2">
      {/* Mobile hamburger button */}
      <div className="flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px]"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav-menu"
        className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-2 space-y-1`}
      >
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={getLinkClass}
            onClick={() => setIsOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Desktop menu */}
      <div className="hidden md:flex flex-wrap gap-2 mt-4 mb-4">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
