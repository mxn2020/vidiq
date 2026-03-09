/**
 * Dynamic color theme system — applies a random accent theme on each visit.
 * Same pattern as justOneLastDrink/JustOneLastDrink.
 */

export interface ColorTheme {
    name: string
    primary: string
    primaryHover: string
    primaryGlow: string
    secondary: string
    accent: string
}

const THEMES: ColorTheme[] = [
    {
        name: 'Cyan',
        primary: '#06B6D4',
        primaryHover: '#22D3EE',
        primaryGlow: 'rgba(6, 182, 212, 0.3)',
        secondary: '#3B82F6',
        accent: '#14B8A6',
    },
    {
        name: 'Violet',
        primary: '#8B5CF6',
        primaryHover: '#A78BFA',
        primaryGlow: 'rgba(139, 92, 246, 0.3)',
        secondary: '#EC4899',
        accent: '#6366F1',
    },
    {
        name: 'Emerald',
        primary: '#10B981',
        primaryHover: '#34D399',
        primaryGlow: 'rgba(16, 185, 129, 0.3)',
        secondary: '#06B6D4',
        accent: '#14B8A6',
    },
    {
        name: 'Rose',
        primary: '#F43F5E',
        primaryHover: '#FB7185',
        primaryGlow: 'rgba(244, 63, 94, 0.3)',
        secondary: '#8B5CF6',
        accent: '#EC4899',
    },
    {
        name: 'Amber',
        primary: '#F59E0B',
        primaryHover: '#FBBF24',
        primaryGlow: 'rgba(245, 158, 11, 0.3)',
        secondary: '#EF4444',
        accent: '#F97316',
    },
]

export function getRandomTheme(): ColorTheme {
    return THEMES[Math.floor(Math.random() * THEMES.length)]
}

export function applyTheme(theme: ColorTheme): void {
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-primary-hover', theme.primaryHover)
    root.style.setProperty('--color-primary-glow', theme.primaryGlow)
    root.style.setProperty('--color-secondary', theme.secondary)
    root.style.setProperty('--color-accent', theme.accent)

    // Update gradient vars that depend on primary
    root.style.setProperty('--gradient-button', `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`)
    root.style.setProperty('--gradient-timeline', `linear-gradient(90deg, ${theme.primary}, ${theme.accent}, ${theme.secondary})`)
    root.style.setProperty('--color-border', `${theme.primary}26`) // ~15% opacity
    root.style.setProperty('--color-border-hover', `${theme.primary}4d`) // ~30% opacity
}
