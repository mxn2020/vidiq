import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../Toast'

function TestTrigger() {
    const { addToast } = useToast()
    return (
        <div>
            <button onClick={() => addToast('Success message', 'success')}>Show Success</button>
            <button onClick={() => addToast('Error message', 'error')}>Show Error</button>
            <button onClick={() => addToast('Warning message', 'warning')}>Show Warning</button>
            <button onClick={() => addToast('Default message')}>Show Default</button>
        </div>
    )
}

describe('Toast', () => {
    afterEach(() => { vi.restoreAllMocks() })

    it('renders success toast', () => {
        render(<ToastProvider><TestTrigger /></ToastProvider>)
        fireEvent.click(screen.getByText('Show Success'))
        expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    it('renders error toast', () => {
        render(<ToastProvider><TestTrigger /></ToastProvider>)
        fireEvent.click(screen.getByText('Show Error'))
        expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('renders warning toast', () => {
        render(<ToastProvider><TestTrigger /></ToastProvider>)
        fireEvent.click(screen.getByText('Show Warning'))
        expect(screen.getByText('Warning message')).toBeInTheDocument()
    })

    it('defaults to success type', () => {
        render(<ToastProvider><TestTrigger /></ToastProvider>)
        fireEvent.click(screen.getByText('Show Default'))
        expect(screen.getByText('Default message')).toBeInTheDocument()
    })

    it('auto-dismisses after timeout', async () => {
        vi.useFakeTimers()
        render(<ToastProvider><TestTrigger /></ToastProvider>)
        fireEvent.click(screen.getByText('Show Success'))
        expect(screen.getByText('Success message')).toBeInTheDocument()
        await act(async () => { vi.advanceTimersByTime(4100) })
        expect(screen.queryByText('Success message')).not.toBeInTheDocument()
        vi.useRealTimers()
    })

    it('renders multiple toasts', () => {
        render(<ToastProvider><TestTrigger /></ToastProvider>)
        fireEvent.click(screen.getByText('Show Success'))
        fireEvent.click(screen.getByText('Show Error'))
        expect(screen.getByText('Success message')).toBeInTheDocument()
        expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('throws when useToast is used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
        function Broken() { useToast(); return null }
        expect(() => render(<Broken />)).toThrow('useToast must be used within ToastProvider')
        consoleSpy.mockRestore()
    })
})
