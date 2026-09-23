import { useState } from 'react'
import Navbar from '@/components/Navbar'
import MobileMenu from '@/components/MobileMenu'
import Section1 from '@/components/Section1'
import Section2 from '@/components/Section2'
import Section3 from '@/components/Section3'
import { useVideoScrub } from '@/hooks/useVideoScrub'
import { VIDEO_URL } from '@/lib/constants'

function getS1Opacity(p: number) {
  if (p < 0.2) return 1
  return Math.max(0, 1 - (p - 0.2) / 0.08)
}

function getS2Opacity(p: number) {
  if (p < 0.32) return 0
  if (p < 0.4) return (p - 0.32) / 0.08
  if (p < 0.55) return 1
  return Math.max(0, 1 - (p - 0.55) / 0.08)
}

function getS3Opacity(p: number) {
  if (p < 0.67) return 0
  if (p < 0.75) return (p - 0.67) / 0.08
  return 1
}

export default function App() {
  const { videoRef, canvasRef, progress, canvasLive } = useVideoScrub(VIDEO_URL)
  const [menuOpen, setMenuOpen] = useState(false)

  const isLight = progress > 0.55

  return (
    <div id="scroll-track" className="relative h-[500vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
        />

        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            canvasLive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 pointer-events-none">
          <Navbar isLight={isLight} onOpenMenu={() => setMenuOpen(true)} />
          <Section1 opacity={getS1Opacity(progress)} />
          <Section2 opacity={getS2Opacity(progress)} />
          <Section3 opacity={getS3Opacity(progress)} />
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
