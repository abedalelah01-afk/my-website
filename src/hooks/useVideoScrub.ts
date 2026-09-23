import { useEffect, useRef, useState, useCallback } from 'react'
import MP4Box, { DataStream, MP4Info, MP4Sample } from 'mp4box'

const LERP_TAU = 8
const SNAP = 0.002
const LRU_MAX = 24
const LEAD = 24
const WATCHDOG_MS = 60000

interface BankEntry {
  ts: number // microseconds
  blob: Blob
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getExtractionDescription(mp4boxfile: ReturnType<typeof MP4Box.createFile>, trackId: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trak: any = mp4boxfile.getTrackById(trackId)
  const entries = trak?.mdia?.minf?.stbl?.stsd?.entries ?? []
  for (const entry of entries) {
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C
    if (box) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN)
      box.write(stream)
      return new Uint8Array(stream.buffer, 8)
    }
  }
  return undefined
}

export function useVideoScrub(videoSrc: string) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [progress, setProgress] = useState(0)
  const [canvasLive, setCanvasLive] = useState(false)

  const bankRef = useRef<BankEntry[]>([])
  const lruRef = useRef<Map<number, ImageBitmap | null>>(new Map())
  const currentTimeRef = useRef(0)
  const durationRef = useRef(0)
  const canvasLiveRef = useRef(false)
  const revertedRef = useRef(false)
  const buildingRef = useRef(false)
  const rafIdRef = useRef<number>()
  const lastFrameTsRef = useRef<number | null>(null)
  const watchdogRef = useRef<ReturnType<typeof setTimeout>>()

  const getScrollSpan = useCallback(() => {
    const el = document.getElementById('scroll-track')
    if (!el) return 1
    return Math.max(1, el.offsetHeight - window.innerHeight)
  }, [])

  const getProgress = useCallback(() => {
    const span = getScrollSpan()
    const p = window.scrollY / span
    return Math.min(1, Math.max(0, p))
  }, [getScrollSpan])

  const nearestIndex = (tSec: number) => {
    const bank = bankRef.current
    if (bank.length === 0) return -1
    const target = tSec * 1e6
    let lo = 0
    let hi = bank.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (bank[mid].ts < target) lo = mid + 1
      else hi = mid
    }
    if (lo > 0 && Math.abs(bank[lo - 1].ts - target) <= Math.abs(bank[lo].ts - target)) {
      return lo - 1
    }
    return lo
  }

  const warmLRU = useCallback(async (i: number) => {
    const bank = bankRef.current
    const lru = lruRef.current
    const wanted = [i - 1, i, i + 1, i + 2].filter((x) => x >= 0 && x < bank.length)

    for (const idx of wanted) {
      if (!lru.has(idx)) {
        try {
          const bmp = await createImageBitmap(bank[idx].blob)
          lru.set(idx, bmp)
        } catch {
          lru.set(idx, null)
        }
      }
    }

    if (lru.size > LRU_MAX) {
      const keys = Array.from(lru.keys()).sort((a, b) => Math.abs(b - i) - Math.abs(a - i))
      const wantedSet = new Set(wanted)
      for (const key of keys) {
        if (lru.size <= LRU_MAX) break
        if (wantedSet.has(key)) continue
        const bmp = lru.get(key)
        bmp?.close()
        lru.delete(key)
      }
    }
  }, [])

  const drawFrame = useCallback(
    (tSec: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const i = nearestIndex(tSec)
      if (i < 0) return
      const bmp = lruRef.current.get(i)
      if (bmp) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
          if (!canvasLiveRef.current) {
            canvasLiveRef.current = true
            setCanvasLive(true)
          }
        }
      }
      void warmLRU(i)
    },
    [warmLRU],
  )

  // Main rAF loop: scroll progress + lerp + draw/seek
  useEffect(() => {
    const reduced = prefersReducedMotion()

    const tick = (ts: number) => {
      const dt = lastFrameTsRef.current == null ? 0 : Math.min(0.1, (ts - lastFrameTsRef.current) / 1000)
      lastFrameTsRef.current = ts

      const p = getProgress()
      setProgress(p)

      const dur = durationRef.current
      if (dur > 0) {
        const target = p * dur
        if (reduced) {
          currentTimeRef.current = target
        } else {
          const c = currentTimeRef.current
          const next = c + (target - c) * (1 - Math.exp(-dt * LERP_TAU))
          currentTimeRef.current = Math.abs(target - next) < SNAP ? target : next
        }

        if (canvasLiveRef.current && !revertedRef.current) {
          drawFrame(currentTimeRef.current)
        } else {
          const video = videoRef.current
          if (video && !video.seeking && Math.abs(video.currentTime - currentTimeRef.current) > 0.01) {
            try {
              video.currentTime = currentTimeRef.current
            } catch {
              // ignore seek errors before metadata is ready
            }
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [drawFrame, getProgress])

  // Resize / orientation handling
  useEffect(() => {
    const handle = () => setProgress(getProgress())
    window.addEventListener('resize', handle)
    window.addEventListener('orientationchange', handle)
    return () => {
      window.removeEventListener('resize', handle)
      window.removeEventListener('orientationchange', handle)
    }
  }, [getProgress])

  // Video metadata -> duration
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onLoaded = () => {
      durationRef.current = video.duration || 0
    }
    video.addEventListener('loadedmetadata', onLoaded)
    if (video.readyState >= 1) onLoaded()
    return () => video.removeEventListener('loadedmetadata', onLoaded)
  }, [])

  // Frame-bank extraction via WebCodecs + mp4box
  useEffect(() => {
    if (prefersReducedMotion()) return
    if (typeof window === 'undefined' || !('VideoDecoder' in window)) return

    let cancelled = false

    const build = async (hardwareAcceleration: VideoDecoderConfig['hardwareAcceleration'] = 'no-preference') => {
      buildingRef.current = true

      const mp4boxfile = MP4Box.createFile()
      let encodeCanvas: OffscreenCanvas | HTMLCanvasElement | null = null
      let encodeCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null
      let encodeW = 0
      let encodeH = 0
      let pendingOutputs = 0
      let sawError = false

      const makeBlob = (frame: VideoFrame): Promise<Blob> => {
        if (!encodeCanvas) {
          const maxW = 960
          const scale = Math.min(1, maxW / frame.displayWidth)
          encodeW = Math.max(2, Math.round(frame.displayWidth * scale))
          encodeH = Math.max(2, Math.round(frame.displayHeight * scale))
          if (typeof OffscreenCanvas !== 'undefined') {
            encodeCanvas = new OffscreenCanvas(encodeW, encodeH)
            encodeCtx = encodeCanvas.getContext('2d')
          } else {
            const c = document.createElement('canvas')
            c.width = encodeW
            c.height = encodeH
            encodeCanvas = c
            encodeCtx = c.getContext('2d')
          }
        }
        if (!encodeCtx || !encodeCanvas) return Promise.reject(new Error('no encode canvas'))
        encodeCtx.drawImage(frame, 0, 0, encodeW, encodeH)

        if (encodeCanvas instanceof OffscreenCanvas) {
          return encodeCanvas.convertToBlob({ type: 'image/webp', quality: 0.82 })
        }
        return new Promise<Blob>((resolve, reject) => {
          ;(encodeCanvas as HTMLCanvasElement).toBlob(
            (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
            'image/webp',
            0.82,
          )
        })
      }

      const decoder = new VideoDecoder({
        output: (frame) => {
          pendingOutputs++
          makeBlob(frame)
            .then((blob) => {
              bankRef.current.push({ ts: frame.timestamp, blob })
            })
            .catch(() => {
              // skip failed frame
            })
            .finally(() => {
              pendingOutputs--
              frame.close()
            })
        },
        error: () => {
          sawError = true
        },
      })

      await new Promise<void>((resolve, reject) => {
        mp4boxfile.onReady = (info: MP4Info) => {
          const track = info.videoTracks[0]
          if (!track) {
            reject(new Error('no video track'))
            return
          }
          durationRef.current = info.duration / info.timescale

          const description = getExtractionDescription(mp4boxfile, track.id)

          try {
            decoder.configure({
              codec: track.codec,
              codedWidth: track.video?.width,
              codedHeight: track.video?.height,
              description,
              hardwareAcceleration,
            })
          } catch (e) {
            reject(e)
            return
          }

          mp4boxfile.setExtractionOptions(track.id, null, { nbSamples: 100 })

          mp4boxfile.onSamples = (_id: number, _user: unknown, samples: MP4Sample[]) => {
            void (async () => {
              for (const sample of samples) {
                if (cancelled || sawError) return
                while (decoder.decodeQueueSize > LEAD) {
                  await new Promise<void>((r) => {
                    decoder.addEventListener('dequeue', () => r(), { once: true })
                  })
                }
                const chunk = new EncodedVideoChunk({
                  type: sample.is_sync ? 'key' : 'delta',
                  timestamp: (sample.cts / sample.timescale) * 1e6,
                  duration: (sample.duration / sample.timescale) * 1e6,
                  data: sample.data,
                })
                try {
                  decoder.decode(chunk)
                } catch {
                  sawError = true
                  return
                }
              }
            })()
          }

          mp4boxfile.start()
          resolve()
        }
        mp4boxfile.onError = (e: string) => reject(new Error(e))

        fetch(videoSrc)
          .then((res) => res.arrayBuffer())
          .then((buf) => {
            if (cancelled) return
            const mp4Buf = buf as ArrayBuffer & { fileStart: number }
            mp4Buf.fileStart = 0
            mp4boxfile.appendBuffer(mp4Buf)
            mp4boxfile.flush()
          })
          .catch(reject)
      })

      // wait for decode queue to fully drain
      while (!cancelled && (decoder.decodeQueueSize > 0 || pendingOutputs > 0)) {
        await new Promise((r) => setTimeout(r, 50))
      }

      if (cancelled) return

      if (sawError) {
        throw new Error('decode error')
      }

      bankRef.current.sort((a, b) => a.ts - b.ts)
      buildingRef.current = false

      try {
        decoder.close()
      } catch {
        // already closed
      }
    }

    watchdogRef.current = setTimeout(() => {
      if (buildingRef.current && !canvasLiveRef.current) {
        cancelled = true
        revertedRef.current = true
        canvasLiveRef.current = false
        setCanvasLive(false)
      }
    }, WATCHDOG_MS)

    const start = () => {
      build('no-preference').catch(() => {
        if (cancelled) return
        build('prefer-software').catch(() => {
          if (cancelled) return
          revertedRef.current = true
          canvasLiveRef.current = false
          setCanvasLive(false)
        })
      })
    }

    if (document.readyState === 'complete') {
      start()
    } else {
      window.addEventListener('load', start, { once: true })
    }

    return () => {
      cancelled = true
      if (watchdogRef.current) clearTimeout(watchdogRef.current)
      window.removeEventListener('load', start)
      const lru = lruRef.current
      lru.forEach((bmp) => bmp?.close())
      lru.clear()
    }
  }, [videoSrc])

  return { videoRef, canvasRef, progress, canvasLive }
}
