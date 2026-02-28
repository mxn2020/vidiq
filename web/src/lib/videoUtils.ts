export async function extractFrames(file: File, maxFrames = 15): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.src = URL.createObjectURL(file)
        video.muted = true
        video.crossOrigin = 'anonymous'

        video.onloadeddata = async () => {
            const frames: string[] = []
            const duration = video.duration
            if (!duration || !isFinite(duration)) {
                return reject(new Error('Invalid video duration'))
            }

            // Extract frames evenly spaced, up to maxFrames
            const step = Math.max(0.5, duration / maxFrames)
            let currentTime = 0.1 // start slightly past 0 to avoid black frames

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return reject(new Error('No canvas context available'))

            // Set resolution for NVIDIA API (max 768px on longest side for balance of detail/payload size)
            const MAX_DIM = 768
            let width = video.videoWidth
            let height = video.videoHeight
            if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) {
                    height = Math.round((height * MAX_DIM) / width)
                    width = MAX_DIM
                } else {
                    width = Math.round((width * MAX_DIM) / height)
                    height = MAX_DIM
                }
            }
            canvas.width = width
            canvas.height = height

            const captureFrame = () => {
                return new Promise<void>((r) => {
                    video.onseeked = () => {
                        ctx.drawImage(video, 0, 0, width, height)
                        // Get base64 string, remove 'data:image/jpeg;base64,' prefix for NVIDIA API
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
                        const base64 = dataUrl.split(',')[1]
                        if (base64) {
                            frames.push(base64)
                        }
                        r()
                    }
                    video.currentTime = currentTime
                })
            }

            try {
                // Read up to maxFrames
                for (let i = 0; i < maxFrames && currentTime < duration; i++) {
                    await captureFrame()
                    currentTime += step
                }
                URL.revokeObjectURL(video.src)
                resolve(frames)
            } catch (err) {
                URL.revokeObjectURL(video.src)
                reject(err)
            }
        }

        video.onerror = () => {
            URL.revokeObjectURL(video.src)
            reject(new Error('Failed to load video file for frame extraction'))
        }
    })
}
