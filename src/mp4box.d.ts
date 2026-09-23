declare module 'mp4box' {
  export interface MP4MediaTrack {
    id: number
    codec: string
    timescale: number
    duration: number
    nb_samples: number
    video?: {
      width: number
      height: number
    }
  }

  export interface MP4Info {
    duration: number
    timescale: number
    isFragmented: boolean
    tracks: MP4MediaTrack[]
    videoTracks: MP4MediaTrack[]
  }

  export interface MP4Sample {
    number: number
    track_id: number
    timescale: number
    dts: number
    cts: number
    duration: number
    is_sync: boolean
    data: ArrayBuffer
  }

  export interface MP4BoxStream {
    buffer: ArrayBuffer
    fileStart: number
  }

  export interface MP4BoxFile {
    onReady?: (info: MP4Info) => void
    onSamples?: (track_id: number, ref: unknown, samples: MP4Sample[]) => void
    onError?: (e: string) => void
    appendBuffer(data: ArrayBuffer & { fileStart: number }): void
    start(): void
    stop(): void
    flush(): void
    setExtractionOptions(
      track_id: number,
      user?: unknown,
      options?: { nbSamples?: number },
    ): void
    getTrackById(id: number): unknown
    releaseUsedSamples(track_id: number, sampleNumber: number): void
    moov?: unknown
    getInfo(): MP4Info
  }

  export function createFile(): MP4BoxFile

  export class DataStream {
    static BIG_ENDIAN: boolean
    static LITTLE_ENDIAN: boolean
    buffer: ArrayBuffer
    constructor(arrayBuffer?: ArrayBuffer, byteOffset?: number, endianness?: boolean)
  }

  const MP4Box: {
    createFile: typeof createFile
  }

  export default MP4Box
}
