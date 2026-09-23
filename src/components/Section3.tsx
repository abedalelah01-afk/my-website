import { ArrowRight } from 'lucide-react'
import Stagger from './Stagger'

export default function Section3({ opacity }: { opacity: number }) {
  const visible = opacity > 0.3

  return (
    <div className="absolute inset-0" style={{ opacity, transition: 'opacity 0.1s ease-out' }}>
      <div className="h-full flex items-center justify-end px-6 sm:px-8 md:px-20 lg:px-32">
        <div className="max-w-2xl text-left">
          <Stagger visible={visible} delay={0}>
            <p className="text-white/60 text-lg tracking-wide mb-4">Halder | Nordvik</p>
          </Stagger>

          <Stagger visible={visible} delay={150}>
            <h2 className="text-[clamp(2rem,4vw,4rem)] font-light text-white leading-[1.2] uppercase tracking-wide mb-8">
              Fueling ambition,
              <br />
              shaping tomorrow.
            </h2>
          </Stagger>

          <Stagger visible={visible} delay={300} className="pointer-events-auto flex items-center gap-4">
            <span className="text-sm tracking-[0.3em] text-white/80 uppercase">Contact Nordvik</span>
            <button
              type="button"
              aria-label="Contact"
              className="flex items-center justify-center rounded-full bg-white hover:scale-110 transition-transform duration-300"
              style={{ width: 40, height: 40 }}
            >
              <ArrowRight size={16} className="text-gray-800" />
            </button>
          </Stagger>
        </div>
      </div>
    </div>
  )
}
