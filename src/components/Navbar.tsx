import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { DARK } from '@/lib/constants'

const LINKS = ['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+']

interface NavbarProps {
  isLight: boolean
  onOpenMenu: () => void
}

export default function Navbar({ isLight, onOpenMenu }: NavbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200)
    return () => clearTimeout(t)
  }, [])

  const navColor = isLight ? '#FFFFFF' : DARK
  const iconColor = isLight ? DARK : '#FFFFFF'

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 pointer-events-auto transition-colors duration-500"
      style={{ color: navColor }}
    >
      {/* Left cluster: desktop links */}
      <div className="hidden lg:flex items-center gap-8 xl:gap-10">
        {LINKS.map((link, i) => (
          <a
            key={link}
            href="#"
            className={`relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70 transition-opacity ${
              i === 0 ? 'pb-3' : ''
            }`}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0px)' : 'translateY(-12px)',
              transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80 + 100}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${
                i * 80 + 100
              }ms`,
            }}
          >
            {link}
            {i === 0 && (
              <span
                className="absolute -bottom-3 left-0 right-0 h-[2px]"
                style={{ backgroundColor: navColor }}
              />
            )}
          </a>
        ))}
      </div>

      {/* Left cluster: mobile hamburger */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="flex lg:hidden flex-col items-start"
        style={{
          gap: '5px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1) 100ms',
        }}
      >
        <span style={{ width: 24, height: 2, backgroundColor: navColor, transition: 'background-color 0.5s' }} />
        <span style={{ width: 24, height: 2, backgroundColor: navColor, transition: 'background-color 0.5s' }} />
        <span style={{ width: 16, height: 2, backgroundColor: navColor, transition: 'background-color 0.5s' }} />
      </button>

      {/* Right cluster */}
      <div
        className="hidden sm:flex items-center gap-6"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0px)' : 'translateY(-12px)',
          transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1) 500ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) 500ms',
        }}
      >
        <button type="button" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="text-xs tracking-[0.2em] uppercase font-medium">NEWS</span>
          <span
            className="flex items-center justify-center rounded-full"
            style={{ width: 20, height: 20, backgroundColor: navColor }}
          >
            <Info size={10} color={iconColor} />
          </span>
        </button>

        <span className="hidden lg:inline text-xs tracking-[0.2em] uppercase font-medium">MENU</span>
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden text-xs tracking-[0.2em] uppercase font-medium hover:opacity-70 transition-opacity"
        >
          MENU
        </button>
      </div>
    </nav>
  )
}
