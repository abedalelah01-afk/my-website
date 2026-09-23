import { ArrowDown, ChevronUp } from 'lucide-react'
import Stagger from './Stagger'
import { DARK } from '@/lib/constants'

export default function Section2({ opacity }: { opacity: number }) {
  const visible = opacity > 0.3

  return (
    <div className="absolute inset-0" style={{ opacity, transition: 'opacity 0.1s ease-out' }}>
      <div className="h-full flex items-center justify-center px-6 sm:px-8">
        <div className="max-w-[900px]">
          <Stagger visible={visible} delay={0}>
            <h2
              className="text-[clamp(1.5rem,4.5vw,4.5rem)] font-extralight tracking-wide leading-[1.3] text-center uppercase"
              style={{ color: DARK }}
            >
              We build lasting partnerships with vision{' '}
              <span style={{ color: `${DARK}CC` }}>and precision</span>{' '}
              <span style={{ color: `${DARK}80` }}>across every frontier</span>
            </h2>
          </Stagger>
        </div>
      </div>

      <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 pointer-events-auto flex flex-col items-center gap-4">
        <Stagger visible={visible} delay={200}>
          <button
            type="button"
            aria-label="Scroll down"
            className="flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ width: 48, height: 48, border: `1px solid ${DARK}66`, color: DARK }}
          >
            <ArrowDown size={18} />
          </button>
        </Stagger>

        <Stagger visible={visible} delay={350} className="mt-4 flex items-center gap-2">
          <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: DARK }} />
          <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: `${DARK}66` }} />
          <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: `${DARK}66` }} />
        </Stagger>

        <Stagger visible={visible} delay={500} className="mt-2">
          <button
            type="button"
            aria-label="Scroll up"
            className="flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ width: 40, height: 40, border: `1px solid ${DARK}4D`, color: `${DARK}CC` }}
          >
            <ChevronUp size={16} />
          </button>
        </Stagger>
      </div>
    </div>
  )
}
