import React, { useMemo, useState } from 'react'

const STORAGE_KEY = 'starkid:onboardingComplete'

const SCREENS = [
  {
    title: 'Welcome to StarKid Command',
    body:
      'Explore space missions, science events, and interactive STEM activities through a command-center style experience.',
  },
  {
    title: 'Learn Through Missions',
    body:
      'Access mission briefings, solve guided challenges, submit your work, and track your learning progress.',
  },
  {
    title: 'Earn Progress',
    body:
      'Sign in to save progress, resume missions, earn XP, and grow your StarKid profile over time.',
  },
]

export function isOnboardingComplete() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setOnboardingComplete() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // ignore
  }
}

export default function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(0)
  const screen = useMemo(() => SCREENS[Math.min(step, SCREENS.length - 1)], [step])
  const isLast = step >= SCREENS.length - 1

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding"
    >
      <div
        style={{
          width: 'min(720px, 100%)',
          borderRadius: 16,
          border: '1px solid rgba(34, 211, 238, 0.25)',
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(10px)',
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            ONBOARDING {step + 1}/{SCREENS.length}
          </div>
          <button
            onClick={() => {
              setOnboardingComplete()
              onDone?.()
            }}
            style={{
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.75)',
              padding: '8px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            Skip
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 0.6 }}>
            {screen.title}
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)' }}>
            {screen.body}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {SCREENS.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: '1px solid rgba(34, 211, 238, 0.35)',
                  background: idx === step ? 'rgba(34, 211, 238, 0.85)' : 'rgba(34, 211, 238, 0.12)',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (!isLast) {
                setStep((s) => Math.min(s + 1, SCREENS.length - 1))
                return
              }
              setOnboardingComplete()
              onDone?.()
            }}
            style={{
              border: '1px solid rgba(34, 211, 238, 0.35)',
              background: 'rgba(34, 211, 238, 0.16)',
              color: '#EAF2FF',
              padding: '10px 14px',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {isLast ? 'START EXPLORING' : 'CONTINUE'}
          </button>
        </div>
      </div>
    </div>
  )
}

