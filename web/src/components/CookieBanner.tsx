import { useState } from 'react'

function CookieBanner() {
    const [visible, setVisible] = useState(() => {
        return !localStorage.getItem('vidiq_cookie_consent')
    })

    const accept = () => {
        localStorage.setItem('vidiq_cookie_consent', 'accepted')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="cookie-banner">
            <p className="cookie-banner-text">
                We use cookies and analytics to improve your experience.
                By continuing to use VidIQ, you agree to our use of cookies.
            </p>
            <button className="btn btn-primary btn-sm" onClick={accept}>
                Accept
            </button>
        </div>
    )
}

export default CookieBanner
