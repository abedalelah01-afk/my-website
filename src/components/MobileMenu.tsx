import { useEffect } from 'react'
import { X } from 'lucide-react'
import { DARK } from '@/lib/constants'

const LINKS = ['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+']

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      style={{ backgroundColor: DARK }}
    >
      <div
        className={`relative flex flex-col h-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? 'translate-y-0' : '-translate-y-8'
        }`}
      >
        <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex items-center justify-center rounded-full border border-white/30 hover:border-white transition-colors"
            style={{ width: 40, height: 40 }}
          >
            <X size={18} color="#FFFFFF" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12">
          {LINKS.map((link, i) => (
            <a
              key={link}
              href="#"
              className={`py-3 text-2xl sm:text-3xl font-light tracking-wide uppercase transition-colors ${
                i === 0 ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0px)' : 'translateY(20px)',
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${
                  i * 60
                }ms`,
              }}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center justify-between px-8 sm:px-12 pb-10">
          <span className="text-xs tracking-[0.2em] uppercase text-white/60">NEWS</span>
          <span className="text-xs tracking-[0.2em] uppercase text-white/60">CONTACT</span>
        </div>
      </div>
    </div>
  )
}
