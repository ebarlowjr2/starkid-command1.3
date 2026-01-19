import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ARTEMIS_PROGRAM,
  ARTEMIS_IMAGES,
  ARTEMIS_MISSIONS,
  ARTEMIS_ROCKETS,
  ARTEMIS_SPACECRAFT,
  ARTEMIS_SYSTEMS,
  ARTEMIS_KNOWLEDGE,
  MISSION_STATUS_COLORS,
} from '../../config/missions/artemis'

const STATUS_DOT_STYLES = `
@keyframes telemetryPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@media (prefers-reduced-motion: reduce) {
  .status-dot { animation: none !important; }
}
@media (max-width: 768px) {
  .artemis-status-bar { flex-direction: column; gap: 12px !important; align-items: flex-start !important; }
  .artemis-status-bar > div { width: 100%; justify-content: space-between; }
  .artemis-module-grid { grid-template-columns: 1fr !important; }
  .artemis-timeline { flex-direction: column !important; }
  .artemis-timeline button { min-width: 100% !important; }
}
`

function StatusDot({ status, size = 8 }) {
  const colors = MISSION_STATUS_COLORS[status] || MISSION_STATUS_COLORS.TBD
  return (
    <span
      className="status-dot"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.text,
        animation: status === 'ACTIVE' || status === 'PLANNED' ? 'telemetryPulse 2s ease-in-out infinite' : 'none',
      }}
    />
  )
}

function StatusBadge({ status, small = false }) {
  const colors = MISSION_STATUS_COLORS[status] || MISSION_STATUS_COLORS.TBD
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: small ? '2px 8px' : '4px 12px',
        borderRadius: 4,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: small ? 10 : 11,
        fontWeight: 700,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      <StatusDot status={status} size={small ? 6 : 8} />
      {status}
    </span>
  )
}

function ModuleCard({ title, status, children, accentColor = '#22d3ee' }) {
  const getAccentRgb = () => {
    if (accentColor === '#22d3ee') return '34, 211, 238'
    if (accentColor === '#f97316') return '249, 115, 22'
    if (accentColor === '#a855f7') return '168, 85, 247'
    return '34, 211, 238'
  }
  return (
    <div style={{ padding: 20, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(${getAccentRgb()}, 0.2)`, backdropFilter: 'blur(8px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.05em' }}>MODULE: {title}</div>
        {status && <StatusDot status={status} />}
      </div>
      {children}
    </div>
  )
}

function KeyValueRow({ label, value, tooltip }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }} title={tooltip}>{label}</span>
      <span style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function MissionPathDiagram({ mission }) {
  const hasLander = mission.lander
  const hasGateway = mission.gateway
  const nodes = [
    { id: 'earth', label: 'EARTH', x: 10 },
    { id: 'tli', label: 'TLI', x: 25, tooltip: 'Trans-Lunar Injection' },
    { id: 'lunar-orbit', label: hasGateway ? 'GATEWAY' : 'LUNAR ORBIT', x: 50 },
  ]
  if (hasLander) nodes.push({ id: 'surface', label: 'SURFACE', x: 65 })
  nodes.push({ id: 'return', label: 'RETURN', x: hasLander ? 80 : 75 })
  nodes.push({ id: 'splashdown', label: 'SPLASHDOWN', x: hasLander ? 95 : 90 })
  return (
    <div style={{ position: 'relative', height: 60, marginTop: 8 }}>
      <div style={{ position: 'absolute', top: 20, left: '5%', right: '5%', height: 2, background: 'linear-gradient(90deg, #22d3ee, #a855f7)', borderRadius: 1 }} />
      {nodes.map((node, i) => (
        <div key={node.id} style={{ position: 'absolute', left: `${node.x}%`, top: 12, transform: 'translateX(-50%)', textAlign: 'center' }} title={node.tooltip}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: i === 0 ? '#22c55e' : i === nodes.length - 1 ? '#3b82f6' : '#22d3ee', border: '2px solid rgba(0,0,0,0.5)', margin: '0 auto 4px' }} />
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{node.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function ArtemisPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('ops')
  const [expandedKnowledge, setExpandedKnowledge] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const missionParam = searchParams.get('mission')
  const initialMissionId = ARTEMIS_MISSIONS.find(m => m.id === missionParam)?.id || 'artemis-1'
  const [selectedMissionId, setSelectedMissionId] = useState(initialMissionId)

  useEffect(() => {
    if (missionParam && ARTEMIS_MISSIONS.find(m => m.id === missionParam)) {
      setSelectedMissionId(missionParam)
    }
  }, [missionParam])

  const handleMissionSelect = (missionId) => {
    setSelectedMissionId(missionId)
    setSearchParams({ mission: missionId }, { replace: true })
  }

  const selectedMission = ARTEMIS_MISSIONS.find((m) => m.id === selectedMissionId)
  const rocketData = selectedMission ? ARTEMIS_ROCKETS[selectedMission.rocket] : null
  const rocketConfig = rocketData?.configurations?.[selectedMission?.rocketConfig]
  const handleRefresh = () => setLastRefresh(new Date())
  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <div className="p-4" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <style>{STATUS_DOT_STYLES}</style>
      <div className="artemis-status-bar" style={{ position: 'sticky', top: 0, zIndex: 100, marginBottom: 24, padding: '12px 20px', borderRadius: 12, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(34, 211, 238, 0.3)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>PROGRAM:</span>
          <span style={{ fontSize: 14, color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>ARTEMIS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>STATUS:</span>
          <StatusBadge status="ACTIVE" small />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>MISSION:</span>
          <span style={{ fontSize: 12, color: '#22d3ee', fontWeight: 600, fontFamily: 'monospace' }}>{selectedMission?.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>HARDWARE:</span>
          <span style={{ fontSize: 11, color: '#fff', fontFamily: 'monospace' }}>SLS + ORION{selectedMission?.lander ? ' + HLS' : ''}{selectedMission?.gateway ? ' + GATEWAY' : ''}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>DESTINATION:</span>
          <span style={{ fontSize: 11, color: '#fff', fontFamily: 'monospace' }}>{selectedMission?.gateway ? 'LUNAR GATEWAY' : selectedMission?.lander ? 'LUNAR SURFACE' : 'LUNAR ORBIT'}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>LAST REFRESH:</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{formatTime(lastRefresh)}</span>
          <button onClick={handleRefresh} style={{ background: 'transparent', border: 'none', color: '#22d3ee', cursor: 'pointer', padding: 4, fontSize: 14 }} title="Refresh data">↻</button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button onClick={() => navigate('/explore')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(34, 211, 238, 0.3)', background: 'rgba(34, 211, 238, 0.1)', cursor: 'pointer', color: '#22d3ee', fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>← BACK TO EXPLORE</button>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setViewMode('ops')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: viewMode === 'ops' ? 'rgba(34, 211, 238, 0.3)' : 'transparent', color: viewMode === 'ops' ? '#22d3ee' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>OPS VIEW</button>
          <button onClick={() => setViewMode('learn')} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: viewMode === 'learn' ? 'rgba(168, 85, 247, 0.3)' : 'transparent', color: viewMode === 'learn' ? '#a855f7' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>LEARN VIEW</button>
        </div>
      </div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>MISSION TIMELINE</div>
        <div className="artemis-timeline" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {ARTEMIS_MISSIONS.map((mission, index) => (
            <button key={mission.id} onClick={() => handleMissionSelect(mission.id)} style={{ flex: '0 0 auto', minWidth: 160, padding: '16px 20px', borderRadius: 12, border: selectedMissionId === mission.id ? '2px solid #22d3ee' : '1px solid rgba(255,255,255,0.15)', background: selectedMissionId === mission.id ? 'rgba(34, 211, 238, 0.15)' : 'rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
              {index < ARTEMIS_MISSIONS.length - 1 && <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', width: 16, height: 2, background: 'rgba(255,255,255,0.2)', zIndex: 1 }} />}
              <div style={{ fontSize: 16, fontWeight: 700, color: selectedMissionId === mission.id ? '#22d3ee' : '#fff', marginBottom: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{mission.name}</div>
              <StatusBadge status={mission.status} small />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: 'monospace' }}>{mission.missionType}</div>
            </button>
          ))}
        </div>
      </div>
      {selectedMission && (
        <div className="artemis-module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 32 }}>
          <ModuleCard title="MISSION BRIEF" status={selectedMission.status}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'monospace' }}>{selectedMission.name}</h2>
              <StatusBadge status={selectedMission.status} />
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 16px', fontFamily: 'system-ui' }}>{selectedMission.summary}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <KeyValueRow label="TYPE" value={selectedMission.missionType} />
              <KeyValueRow label="DURATION" value={selectedMission.duration} />
            </div>
          </ModuleCard>
          <ModuleCard title="PRIMARY OBJECTIVES" status="NOMINAL">
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {selectedMission.objectives.slice(0, viewMode === 'ops' ? 4 : undefined).map((obj, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                  <span style={{ color: '#22d3ee', fontWeight: 700, fontFamily: 'monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                  {obj}
                </li>
              ))}
            </ul>
            {selectedMission.achievements && viewMode === 'learn' && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginBottom: 8, fontFamily: 'monospace' }}>ACHIEVEMENTS</div>
                {selectedMission.achievements.map((ach, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6, paddingLeft: 12, borderLeft: '2px solid #22c55e' }}>{ach}</div>
                ))}
              </div>
            )}
          </ModuleCard>
          <ModuleCard title="KEY DATES" status={selectedMission.status === 'COMPLETED' ? 'COMPLETED' : 'PLANNED'}>
            <KeyValueRow label="LAUNCH WINDOW" value={selectedMission.dates?.launchWindow || selectedMission.launchDate || selectedMission.targetLaunch} />
            {selectedMission.dates?.milestones && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: 'monospace' }}>MILESTONES</div>
                {selectedMission.dates.milestones.slice(0, viewMode === 'ops' ? 4 : undefined).map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 11 }}>
                    <span style={{ color: '#22d3ee', fontFamily: 'monospace', minWidth: 80 }}>{m.date}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.event}</span>
                  </div>
                ))}
              </div>
            )}
          </ModuleCard>
          <ModuleCard title="HARDWARE STACK" status="NOMINAL" accentColor="#f97316">
            <div style={{ marginBottom: 16 }}>
              <div onClick={() => navigate('/missions/artemis/sls')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', cursor: 'pointer', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>ROCKET</div>
                  <div style={{ fontSize: 13, color: '#f97316', fontWeight: 600, fontFamily: 'monospace' }}>SLS {rocketConfig?.name}</div>
                </div>
                <span style={{ color: '#f97316', fontSize: 14 }}>→</span>
              </div>
              <div onClick={() => navigate('/missions/artemis/orion')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)', cursor: 'pointer', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>SPACECRAFT</div>
                  <div style={{ fontSize: 13, color: '#22d3ee', fontWeight: 600, fontFamily: 'monospace' }}>Orion MPCV</div>
                </div>
                <span style={{ color: '#22d3ee', fontSize: 14 }}>→</span>
              </div>
              {selectedMission.lander && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>LANDER</div>
                    <div style={{ fontSize: 13, color: '#a855f7', fontWeight: 600, fontFamily: 'monospace' }}>Starship HLS</div>
                  </div>
                  <StatusBadge status="IN DEVELOPMENT" small />
                </div>
              )}
              {selectedMission.gateway && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>STATION</div>
                    <div style={{ fontSize: 13, color: '#eab308', fontWeight: 600, fontFamily: 'monospace' }}>Lunar Gateway</div>
                  </div>
                  <StatusBadge status="IN DEVELOPMENT" small />
                </div>
              )}
            </div>
          </ModuleCard>
          <ModuleCard title="CREW ROSTER" status={selectedMission.crew?.status || 'TBD'}>
            {selectedMission.crew?.members ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {selectedMission.crew.members.map((member, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{member.country === 'USA' ? '🇺🇸' : member.country === 'CAN' ? '🇨🇦' : '🌍'}</span>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{member.name}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#22d3ee', fontFamily: 'monospace', marginBottom: 2 }}>{member.role}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{member.agency}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍🚀</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{selectedMission.crew === null ? 'UNCREWED MISSION' : 'CREW: TBD'}</div>
                {selectedMission.crew?.landingCrew && (
                  <div style={{ fontSize: 11, color: '#a855f7', marginTop: 8, fontFamily: 'monospace' }}>{selectedMission.crew.landingCrew} astronauts will land on the Moon</div>
                )}
              </div>
            )}
          </ModuleCard>
          <ModuleCard title="MISSION PATH" status="NOMINAL">
            <MissionPathDiagram mission={selectedMission} />
            {viewMode === 'learn' && (
              <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                <strong style={{ color: '#22d3ee' }}>TLI</strong> = Trans-Lunar Injection: The burn that sends the spacecraft from Earth orbit toward the Moon.
                {selectedMission.gateway && <span> <strong style={{ color: '#eab308' }}>Gateway</strong> orbits in a near-rectilinear halo orbit (NRHO).</span>}
              </div>
            )}
          </ModuleCard>
          <ModuleCard title="SYSTEMS SNAPSHOT" status="NOMINAL">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {ARTEMIS_SYSTEMS.slice(0, viewMode === 'ops' ? 4 : 6).map((system) => (
                <div key={system.id} style={{ padding: 10, borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} title={system.importance}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <StatusDot status="ACTIVE" size={6} />
                    <span style={{ fontSize: 10, color: '#22d3ee', fontWeight: 600, fontFamily: 'monospace' }}>{system.name.toUpperCase()}</span>
                  </div>
                  {viewMode === 'learn' && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{system.description}</div>}
                </div>
              ))}
            </div>
          </ModuleCard>
          <ModuleCard title="KNOWLEDGE BASE" status="NOMINAL" accentColor="#a855f7">
            {selectedMission.facts && (
              <div style={{ marginBottom: viewMode === 'learn' ? 16 : 0 }}>
                <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 700, marginBottom: 8, fontFamily: 'monospace' }}>DID YOU KNOW?</div>
                {selectedMission.facts.slice(0, viewMode === 'ops' ? 2 : undefined).map((fact, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid #a855f7', lineHeight: 1.5 }}>{fact}</div>
                ))}
              </div>
            )}
            {viewMode === 'learn' && (
              <div>
                {ARTEMIS_KNOWLEDGE.map((item) => (
                  <div key={item.id} style={{ marginBottom: 8, borderRadius: 8, background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                    <button onClick={() => setExpandedKnowledge(expandedKnowledge === item.id ? null : item.id)} style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontSize: 13, fontWeight: 500, textAlign: 'left' }}>
                      {item.title}
                      <span style={{ color: '#a855f7' }}>{expandedKnowledge === item.id ? '−' : '+'}</span>
                    </button>
                    {expandedKnowledge === item.id && <div style={{ padding: '0 16px 16px', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{item.content}</div>}
                  </div>
                ))}
              </div>
            )}
          </ModuleCard>
          {selectedMission.publicParticipation && (
            <ModuleCard title="PUBLIC PARTICIPATION" status="ACTIVE" accentColor="#22d3ee">
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12, fontFamily: 'system-ui' }}>
                  {selectedMission.publicParticipation.title.toUpperCase()}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 1.5 }}>
                  Generate your Artemis II boarding pass and send your name aboard Orion.
                </p>
                <a
                  href={selectedMission.publicParticipation.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(34, 211, 238, 0.3)',
                  }}
                >
                  {selectedMission.publicParticipation.ctaLabel}
                </a>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 12, fontFamily: 'monospace' }}>
                  {selectedMission.publicParticipation.note}
                </div>
                {selectedMission.publicParticipation.moreInfoUrl && (
                  <a
                    href={selectedMission.publicParticipation.moreInfoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ display: 'block', fontSize: 11, color: '#22d3ee', marginTop: 12, textDecoration: 'none' }}
                  >
                    NASA announcement →
                  </a>
                )}
              </div>
            </ModuleCard>
          )}
        </div>
      )}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>VEHICLE GALLERY</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div onClick={() => navigate('/missions/artemis/sls')} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(249, 115, 22, 0.3)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            <img src={ARTEMIS_IMAGES.slsLaunch.url} alt={ARTEMIS_IMAGES.slsLaunch.alt} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f97316' }}>SPACE LAUNCH SYSTEM</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>VIEW DETAILS →</div>
            </div>
          </div>
          <div onClick={() => navigate('/missions/artemis/orion')} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34, 211, 238, 0.3)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            <img src={ARTEMIS_IMAGES.orionEarth.url} alt={ARTEMIS_IMAGES.orionEarth.alt} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee' }}>ORION SPACECRAFT</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>VIEW DETAILS →</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontFamily: 'monospace' }}>DATA SOURCES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11 }}>
          <a href="https://www.nasa.gov/artemis" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none' }}>NASA Artemis Program →</a>
          <a href="https://www.nasa.gov/humans-in-space/orion-spacecraft/" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none' }}>NASA Orion →</a>
          <a href="https://www.nasa.gov/exploration/systems/sls/index.html" target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'none' }}>NASA SLS →</a>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8, fontFamily: 'monospace' }}>LAST REVIEWED: January 2025</div>
      </div>
    </div>
  )
}
