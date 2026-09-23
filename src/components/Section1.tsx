import { ArrowRight } from 'lucide-react'
import Stagger from './Stagger'
import { DARK } from '@/lib/constants'

export default function Section1({ opacity }: { opacity: number }) {
  const visible = opacity > 0.3

  return (
    <div className="absolute inset-0" style={{ opacity, transition: 'opacity 0.1s ease-out' }}>
      <div className="h-full flex items-center px-6 sm:px-8 md:px-20 lg:px-32">
        <div>
          <Stagger visible={visible} delay={0}>
            <h1
              className="text-[clamp(2rem,5vw,5rem)] font-light uppercase leading-[1.2]"
              style={{ color: DARK }}
            >
              Advancing resources for a cleaner future
            </h1>
          </Stagger>
          <Stagger visible={visible} delay={150} className="mt-6">
            <p className="text-sm tracking-[0.3em] uppercase" style={{ color: `${DARK}E6` }}>
              Sustainable power with purpose
            </p>
          </Stagger>
        </div>
      </div>

      <div className="absolute bottom-12 right-6 sm:right-8 md:right-12 pointer-events-auto">
        <Stagger visible={visible} delay={300}>
          <button
            type="button"
            aria-label="Scroll"
            className="flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ width: 48, height: 48, border: `1px solid ${DARK}80`, color: DARK }}
          >
            <ArrowRight size={18} />
          </button>
        </Stagger>
      </div>
    </div>
  )
}
