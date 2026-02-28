/**
 * Demo mode — generates realistic mock analysis results.
 * Used when VITE_AI_PIPELINE=demo (no API key required).
 */

import type { AnalysisResult, Scene } from '../App'

const DEMO_SCENE_POOLS: Scene[][] = [
    // Pool 1: Racing / Action video
    [
        { startTime: '00:00', endTime: '00:02', title: 'Opening Establishing Shot', description: 'An outdoor racing event on a sunny day. A red race car leads a pack of competitors on a sunlit racetrack. Empty grandstands visible in the background.', objects: ['race car', 'racetrack', 'grandstands', 'barriers'], actions: ['racing', 'leading pack'] },
        { startTime: '00:02', endTime: '00:06', title: 'Cockpit View', description: 'Inside the cockpit, two occupants wear full protective gear including helmets and gloves. The driver grips the steering wheel tightly while the co-pilot adjusts dials.', objects: ['helmet', 'steering wheel', 'dashboard', 'gauges'], actions: ['driving', 'adjusting controls'] },
        { startTime: '00:06', endTime: '00:09', title: 'Dashboard POV', description: 'Through the windshield, the dashboard displays sponsorship branding. The road ahead curves gently with smoke wafting into the cabin from intense acceleration.', objects: ['windshield', 'dashboard', 'smoke', 'branding'], actions: ['accelerating', 'cornering'] },
        { startTime: '00:09', endTime: '00:13', title: 'Controlled Drift Sequence', description: 'The race car executes a deliberate drift around a corner, tires screeching against the tarmac. Thick clouds of smoke billow from the rear wheels.', objects: ['tire smoke', 'tarmac', 'drift marks'], actions: ['drifting', 'controlled slide'] },
        { startTime: '00:13', endTime: '00:20', title: 'Tandem Drift — Aerial View', description: 'Wide-angle drone footage captures both cars drifting simultaneously, leaving dramatic trails of exhaust fumes. The sweeping landscape highlights the venue scale.', objects: ['aerial view', 'exhaust trails', 'landscape', 'two cars'], actions: ['synchronized drifting', 'aerial tracking'] },
        { startTime: '00:20', endTime: '00:28', title: 'Driver Celebration', description: 'Inside the cockpit, the driver raises clenched fists triumphantly. The emotional energy is palpable as they celebrate a successful run.', objects: ['driver', 'fists', 'cockpit interior'], actions: ['celebrating', 'fist pump'] },
        { startTime: '00:28', endTime: '00:35', title: 'Track Overview', description: 'The car continues along the circuit, maneuvering smoothly with consistent performance. Spectators visible in tiered seating nearby.', objects: ['circuit', 'spectators', 'seating'], actions: ['driving', 'cruising'] },
        { startTime: '00:35', endTime: '00:44', title: 'Panoramic Closing', description: 'Expansive aerial perspectives reveal the entire racetrack layout surrounded by greenery, ponds, and distant structures. A panoramic view before the video ends.', objects: ['racetrack layout', 'greenery', 'ponds', 'structures'], actions: ['pull-back shot', 'closing panorama'] },
    ],
    // Pool 2: Cooking / Tutorial
    [
        { startTime: '00:00', endTime: '00:05', title: 'Kitchen Setup', description: 'A well-organized kitchen counter with fresh ingredients laid out. Colorful vegetables, herbs, and utensils arranged methodically.', objects: ['kitchen counter', 'vegetables', 'herbs', 'cutting board', 'knife'], actions: ['preparation', 'mise en place'] },
        { startTime: '00:05', endTime: '00:12', title: 'Ingredient Preparation', description: 'Close-up shots of precise knife work. Onions are finely diced, garlic is minced, and herbs are chiffonaded with expert technique.', objects: ['knife', 'onion', 'garlic', 'herbs'], actions: ['dicing', 'mincing', 'cutting'] },
        { startTime: '00:12', endTime: '00:20', title: 'Cooking Process', description: 'A sizzling pan on the stove. Oil heats up and ingredients are added sequentially, creating aromatic steam and satisfying sizzling sounds.', objects: ['pan', 'stove', 'oil', 'steam'], actions: ['sautéing', 'stirring', 'cooking'] },
        { startTime: '00:20', endTime: '00:30', title: 'Seasoning and Tasting', description: 'The chef adds seasonings — salt, pepper, and specialty spices. A quick taste test with a wooden spoon shows satisfaction with the seasoning.', objects: ['spice jars', 'wooden spoon', 'seasoning'], actions: ['seasoning', 'tasting', 'adjusting'] },
        { startTime: '00:30', endTime: '00:40', title: 'Final Plating', description: 'The finished dish is carefully plated on a pristine white plate. Garnishes are added with tweezers, and a drizzle of sauce completes the presentation.', objects: ['white plate', 'garnish', 'tweezers', 'sauce'], actions: ['plating', 'garnishing', 'drizzling'] },
        { startTime: '00:40', endTime: '00:44', title: 'Final Reveal', description: 'A beauty shot of the completed dish. Shallow depth of field highlights the textures and colors. Steam rises gently from the plate.', objects: ['completed dish', 'steam', 'plate'], actions: ['revealing', 'showcasing'] },
    ],
]

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export async function runDemoAnalysis(youtubeUrl?: string): Promise<AnalysisResult> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000))

    const pool = pickRandom(DEMO_SCENE_POOLS)
    const sceneCount = 4 + Math.floor(Math.random() * (pool.length - 3))
    const scenes = pool.slice(0, sceneCount)
    const objectsDetected = scenes.reduce((sum, s) => sum + (s.objects?.length ?? 0), 0)
    const brandsDetected = Math.random() > 0.5
        ? ['Brand A', 'Brand B', 'Brand C'].slice(0, 1 + Math.floor(Math.random() * 3))
        : []

    const duration = 44

    const title = youtubeUrl
        ? `YouTube Analysis — ${youtubeUrl.slice(0, 50)}`
        : 'Video Analysis'

    const summary = `This video contains ${sceneCount} distinct scenes across ${duration} seconds of footage. ` +
        `The AI identified ${objectsDetected} objects` +
        (brandsDetected.length > 0 ? ` and ${brandsDetected.length} brand references (${brandsDetected.join(', ')})` : '') +
        `. The video features a mix of ${scenes[0]?.title.toLowerCase() ?? 'opening'} and dynamic sequences, ` +
        `with detailed scene-by-scene analysis provided below. ` +
        `This is a demo analysis — connect your NVIDIA API key for real results.`

    return {
        title,
        duration,
        fps: 4,
        scenes,
        totalScenes: sceneCount,
        objectsDetected,
        brandsDetected,
        summary,
        model: 'demo (local)',
        status: 'complete',
    }
}
