import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
    "Decoding your video frame by frame…",
    "Teaching AI to watch TV…",
    "Spotting things you missed…",
    "Building your scene timeline…",
    "Identifying objects and brands…",
    "Running chain-of-thought reasoning…",
    "Parsing timestamped narratives…",
    "Almost there, finalizing analysis…",
]

function LoadingScreen() {
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="loading-screen">
            <div className="loading-spinner" />
            <p className="loading-text">{LOADING_MESSAGES[messageIndex]}</p>
            <div className="loading-progress">
                <div className="loading-progress-bar" />
            </div>
        </div>
    )
}

export default LoadingScreen
