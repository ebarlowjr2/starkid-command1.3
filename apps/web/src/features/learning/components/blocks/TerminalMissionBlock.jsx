import React, { useEffect, useMemo, useRef, useState } from 'react'
import { evaluateMission } from '@starkid/core'
import Terminal from '../Terminal.jsx'
import { createEmulatorBackend } from '../../terminal/terminalBackend.js'

// Terminal mission block: composes the backend-agnostic Terminal with a mission
// objectives/systems panel. All grading is state-based via evaluateMission — the
// student is never checked on which commands they typed. Completion is written
// back through onChange as { emulatorState, passed, completedTaskIds } so the
// lesson player can re-grade deterministically (see core playerValidation).

function StatusDot({ done }) {
  return (
    <span
      className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
        done ? 'bg-emerald-400' : 'bg-white/20'
      }`}
      aria-hidden="true"
    />
  )
}

export default function TerminalMissionBlock({ block, value, onChange }) {
  const mission = block.mission

  // The backend persists across renders; it is re-created only when the mission
  // changes (or on reset). Resume from a saved snapshot when progress rehydrated.
  const backendRef = useRef(null)
  const [terminalKey, setTerminalKey] = useState(0)
  const [evaluation, setEvaluation] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [hintsShown, setHintsShown] = useState(0)

  // Ordered list of all task hints, flattened for progressive reveal.
  const allHints = useMemo(() => {
    const out = []
    for (const task of mission.tasks || []) {
      for (const hint of task.hints || []) {
        out.push({ taskTitle: task.title, ...hint })
      }
    }
    return out.sort((a, b) => (a.level || 0) - (b.level || 0))
  }, [mission])

  function evaluateNow() {
    const snapshot = backendRef.current.getSnapshot()
    const result = evaluateMission(snapshot, mission)
    setEvaluation(result)
    onChange?.({
      emulatorState: snapshot,
      passed: result.passed,
      completedTaskIds: result.completedTaskIds,
    })
    return result
  }

  // (Re)initialize whenever the mission changes.
  useEffect(() => {
    backendRef.current = createEmulatorBackend(mission, value?.emulatorState)
    const snapshot = backendRef.current.getSnapshot()
    setEvaluation(evaluateMission(snapshot, mission))
    setShowDetails(false)
    setHintsShown(0)
    setTerminalKey((k) => k + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id])

  if (!backendRef.current) {
    backendRef.current = createEmulatorBackend(mission, value?.emulatorState)
  }

  const completedTaskIds = evaluation?.completedTaskIds || []
  const taskResults = new Map((evaluation?.tasks || []).map((t) => [t.taskId, t]))
  const allPassed = !!evaluation?.passed

  const handleReset = () => {
    backendRef.current.reset()
    setShowDetails(false)
    setHintsShown(0)
    setTerminalKey((k) => k + 1)
    evaluateNow()
  }

  const handleValidate = () => {
    setShowDetails(true)
    evaluateNow()
  }

  return (
    <div>
      <div className="text-xs text-cyan-200/70 font-mono">LINUX MISSION</div>
      <h2 className="text-lg text-white font-bold mt-2">{mission.title}</h2>
      {mission.subtitle ? (
        <div className="text-cyan-200/70 text-sm mt-1">{mission.subtitle}</div>
      ) : null}
      {mission.narrative ? (
        <p className="text-white/80 mt-3 text-sm whitespace-pre-wrap">{mission.narrative}</p>
      ) : null}

      {mission.objectives?.length ? (
        <ul className="mt-3 text-white/70 text-sm list-disc pl-4">
          {mission.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        {/* Terminal */}
        <div className="lg:flex-1 min-w-0">
          <Terminal
            key={terminalKey}
            backend={backendRef.current}
            onAfterCommand={evaluateNow}
            welcome={[
              `StarKid Command — ${mission.title}`,
              "Type 'help' to list available commands.",
            ]}
          />
        </div>

        {/* Mission panel */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-4">
          {/* Objectives / tasks */}
          <div className="rounded-lg border border-cyan-500/30 bg-black/40 p-3">
            <div className="text-[11px] font-mono text-cyan-200/70">OBJECTIVES</div>
            <ul className="mt-2 flex flex-col gap-2">
              {mission.tasks.map((task) => {
                const done = completedTaskIds.includes(task.id)
                const result = taskResults.get(task.id)
                return (
                  <li key={task.id} className="flex items-start gap-2">
                    <StatusDot done={done} />
                    <div className="min-w-0">
                      <div className={`text-sm ${done ? 'text-emerald-200' : 'text-white/80'}`}>
                        {task.title}
                      </div>
                      <div className="text-white/50 text-xs">{task.description}</div>
                      {showDetails && !done && result ? (
                        <ul className="mt-1 text-[11px] text-red-300/90 list-disc pl-4">
                          {result.results
                            .filter((r) => !r.passed)
                            .map((r, i) => (
                              <li key={i}>{r.message}</li>
                            ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Spacecraft systems status */}
          {mission.systems?.length ? (
            <div className="rounded-lg border border-cyan-500/30 bg-black/40 p-3">
              <div className="text-[11px] font-mono text-cyan-200/70">SPACECRAFT SYSTEMS</div>
              <ul className="mt-2 flex flex-col gap-2">
                {mission.systems.map((sys) => {
                  const ready = completedTaskIds.includes(sys.taskId)
                  return (
                    <li key={sys.id} className="flex items-center justify-between gap-2">
                      <span className="text-white/70 text-xs">{sys.label}</span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          ready
                            ? 'text-emerald-200 bg-emerald-500/15 border border-emerald-500/30'
                            : 'text-amber-200/80 bg-amber-500/10 border border-amber-500/30'
                        }`}
                      >
                        {ready ? sys.readyLabel : sys.pendingLabel}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {/* Hints */}
          {allHints.length ? (
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono text-purple-200/80">HINTS</div>
                <button
                  type="button"
                  onClick={() => setHintsShown((n) => Math.min(n + 1, allHints.length))}
                  disabled={hintsShown >= allHints.length}
                  className="text-[11px] px-2 py-1 rounded border border-purple-400/40 bg-purple-500/20 text-purple-100 disabled:opacity-40"
                >
                  {hintsShown === 0 ? 'Reveal hint' : 'Next hint'}
                </button>
              </div>
              {hintsShown > 0 ? (
                <ul className="mt-2 text-purple-100/90 text-xs list-disc pl-4">
                  {allHints.slice(0, hintsShown).map((h, i) => (
                    <li key={i}>{h.text}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 text-purple-200/60 text-xs">
                  Stuck? Reveal hints one at a time.
                </div>
              )}
            </div>
          ) : null}

          {/* Controls */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleValidate}
              className="flex-1 px-3 py-2 rounded border border-cyan-500/30 bg-cyan-500/20 text-cyan-100 text-xs"
            >
              Validate
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded border border-white/15 bg-black/40 text-white/70 text-xs"
            >
              Reset
            </button>
          </div>

          {/* Status line (accessible) */}
          <div
            role="status"
            aria-live="polite"
            className={`text-xs rounded border p-2 ${
              allPassed
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-cyan-500/20 bg-black/40 text-white/60'
            }`}
          >
            {allPassed
              ? mission.completionBanner || 'All systems ready — mission complete.'
              : `${completedTaskIds.length} / ${mission.tasks.length} objectives complete.`}
          </div>
        </div>
      </div>
    </div>
  )
}
