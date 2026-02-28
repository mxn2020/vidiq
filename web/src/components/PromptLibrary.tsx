const PROMPT_TEMPLATES = [
    {
        id: 'sports',
        label: '🏀 Sports Analysis',
        prompt: 'Focus on the sports techniques, player movements, ball handling, and game strategy. Identify any sports equipment or team branding.',
    },
    {
        id: 'cooking',
        label: '🍳 Cooking Breakdown',
        prompt: 'Focus on the cooking techniques, ingredients used, temperature changes, and plating style. Identify kitchen equipment and food brands.',
    },
    {
        id: 'education',
        label: '📚 Lecture Summary',
        prompt: 'Summarize the educational content. Identify key topics, diagrams, text on screen, and any referenced materials.',
    },
    {
        id: 'travel',
        label: '✈️ Travel Log',
        prompt: 'Identify locations, landmarks, modes of transportation, and cultural elements. Describe the scenery and atmosphere.',
    },
    {
        id: 'security',
        label: '🔒 Security Review',
        prompt: 'Focus on people entering and exiting, vehicles, license plates, and any unusual activity. Note timestamps of significant events.',
    },
    {
        id: 'product',
        label: '📦 Product Review',
        prompt: 'Identify the products being reviewed. Note brand names, model numbers, features demonstrated, and the reviewer\'s reactions.',
    },
    {
        id: 'nature',
        label: '🌿 Nature & Wildlife',
        prompt: 'Identify animals, plants, and environmental features. Describe animal behavior, weather conditions, and terrain.',
    },
    {
        id: 'music',
        label: '🎵 Music Video',
        prompt: 'Describe the visual storytelling, dance choreography, costume changes, set design, and any text or lyrics shown on screen.',
    },
]

interface PromptLibraryProps {
    onSelect: (prompt: string) => void
}

function PromptLibrary({ onSelect }: PromptLibraryProps) {
    return (
        <div style={{ marginTop: 'var(--space-sm)' }}>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 'var(--space-sm)' }}>
                Quick templates:
            </div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-xs)',
            }}>
                {PROMPT_TEMPLATES.map((t) => (
                    <button
                        key={t.id}
                        className="btn btn-ghost btn-sm"
                        onClick={() => onSelect(t.prompt)}
                        style={{
                            fontSize: '0.8rem',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default PromptLibrary
