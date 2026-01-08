import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function ArtemisPage() {
  const navigate = useNavigate()
  const [selectedMissionId, setSelectedMissionId] = useState('artemis-1')
  const [expandedKnowledge, setExpandedKnowledge] = useState(null)

  const selectedMission = ARTEMIS_MISSIONS.find((m) => m.id === selectedMissionId)
  const rocketData = selectedMission ? ARTEMIS_ROCKETS[selectedMission.rocket] : null
  const rocketConfig = rocketData?.configurations?.[selectedMission?.rocketConfig]

  const getStatusStyle = (status) => {
    const colors = MISSION_STATUS_COLORS[status] || MISSION_STATUS_COLORS.TBD
    return {
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.text,
    }
  }

  return (
    <div className="p-4" style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/explore')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid rgba(34, 211, 238, 0.3)',
          background: 'rgba(34, 211, 238, 0.1)',
          cursor: 'pointer',
          color: '#22d3ee',
          fontSize: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          marginBottom: 24,
        }}
      >
        ← BACK TO EXPLORE
      </button>

      {/* Program Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 8px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            letterSpacing: '0.1em',
          }}
        >
          {ARTEMIS_PROGRAM.name}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {ARTEMIS_PROGRAM.subtitle}
        </p>
      </div>

      {/* Hero Image Gallery */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {/* SLS Launch Image */}
        <div
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
          }}
        >
          <img
            src={ARTEMIS_IMAGES.slsLaunch.url}
            alt={ARTEMIS_IMAGES.slsLaunch.alt}
            style={{
              width: '100%',
              height: 280,
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div
            style={{
              display: 'none',
              height: 280,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05))',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            SLS LAUNCH IMAGE
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 16px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f97316', marginBottom: 2 }}>
              SPACE LAUNCH SYSTEM
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
              {ARTEMIS_IMAGES.slsLaunch.caption}
            </div>
          </div>
        </div>

        {/* Orion with Earth Image */}
        <div
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}
        >
          <img
            src={ARTEMIS_IMAGES.orionEarth.url}
            alt={ARTEMIS_IMAGES.orionEarth.alt}
            style={{
              width: '100%',
              height: 280,
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div
            style={{
              display: 'none',
              height: 280,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(34, 211, 238, 0.05))',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            ORION SPACECRAFT IMAGE
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 16px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee', marginBottom: 2 }}>
              ORION SPACECRAFT
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
              {ARTEMIS_IMAGES.orionEarth.caption}
            </div>
          </div>
        </div>
      </div>

      {/* Program Status Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
          padding: 20,
          borderRadius: 16,
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
        }}
      >
        {[
          { label: 'PROGRAM STATUS', value: ARTEMIS_PROGRAM.status },
          { label: 'LEAD AGENCY', value: ARTEMIS_PROGRAM.leadAgency },
          { label: 'PRIMARY ROCKET', value: 'SLS' },
          { label: 'CREW VEHICLE', value: 'Orion' },
          { label: 'DESTINATION', value: ARTEMIS_PROGRAM.destination },
          { label: 'FIRST MISSION', value: ARTEMIS_PROGRAM.firstMission },
        ].map((item) => (
          <div key={item.label}>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 4,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 14,
                color: item.label === 'PROGRAM STATUS' ? '#22c55e' : '#fff',
                fontWeight: 600,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Mission Selector */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          MISSION SELECTOR
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {ARTEMIS_MISSIONS.map((mission) => (
            <button
              key={mission.id}
              onClick={() => setSelectedMissionId(mission.id)}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: selectedMissionId === mission.id
                  ? '2px solid #22d3ee'
                  : '1px solid rgba(255,255,255,0.2)',
                background: selectedMissionId === mission.id
                  ? 'rgba(34, 211, 238, 0.2)'
                  : 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: selectedMissionId === mission.id ? '#22d3ee' : '#fff',
                  marginBottom: 4,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {mission.name}
              </div>
              <span
                style={{
                  ...getStatusStyle(mission.status),
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {mission.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Mission Detail */}
      {selectedMission && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 24,
            marginBottom: 32,
          }}
        >
          {/* Mission Overview */}
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {selectedMission.name}
              </h3>
              <span
                style={{
                  ...getStatusStyle(selectedMission.status),
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {selectedMission.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                  MISSION TYPE
                </div>
                <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                  {selectedMission.missionType}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                  {selectedMission.launchDate ? 'LAUNCH DATE' : 'TARGET LAUNCH'}
                </div>
                <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                  {selectedMission.launchDate || selectedMission.targetLaunch}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                  DURATION
                </div>
                <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                  {selectedMission.duration}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'monospace' }}>
                  ROCKET
                </div>
                <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                  SLS {rocketConfig?.name}
                </div>
              </div>
            </div>

            {/* Mission Highlights */}
            {selectedMission.highlights && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(34, 211, 238, 0.05)',
                  border: '1px solid rgba(34, 211, 238, 0.1)',
                }}
              >
                {selectedMission.highlights.map((h) => (
                  <div key={h.label}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      {h.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: '#22d3ee', fontWeight: 600, fontFamily: 'monospace' }}>
                      {h.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mission Objectives */}
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 16,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              PRIMARY OBJECTIVES
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {selectedMission.objectives.map((obj, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 10,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: '#22d3ee', fontWeight: 700 }}>•</span>
                  {obj}
                </li>
              ))}
            </ul>

            {/* Achievements (for completed missions) */}
            {selectedMission.achievements && (
              <>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#22c55e',
                    marginTop: 24,
                    marginBottom: 16,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  ACHIEVEMENTS
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {selectedMission.achievements.map((ach, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        marginBottom: 10,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>+</span>
                      {ach}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {/* Crew Section (only for crewed missions) */}
      {selectedMission?.crew && (
        <div
          style={{
            marginBottom: 32,
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              CREW MODULE
            </h3>
            <span
              style={{
                ...getStatusStyle(selectedMission.crew.status),
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {selectedMission.crew.status}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {selectedMission.crew.size} ASTRONAUTS
            </span>
          </div>

          {selectedMission.crew.members ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {selectedMission.crew.members.map((member) => (
                <div
                  key={member.name}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: 'rgba(34, 211, 238, 0.05)',
                    border: '1px solid rgba(34, 211, 238, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(34, 211, 238, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#22d3ee',
                      }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#22d3ee', fontFamily: 'monospace' }}>
                        {member.role}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                    {member.agency}
                    {member.previousMissions.length > 0 && (
                      <span> • {member.previousMissions.length} prior mission(s)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: 20,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 12,
              }}
            >
              CREW ASSIGNMENTS PENDING
            </div>
          )}
        </div>
      )}

      {/* Rocket & Spacecraft Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Rocket */}
        {rocketData && (
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#f97316',
                marginBottom: 16,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              LAUNCH VEHICLE
            </h3>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {rocketData.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontFamily: 'monospace' }}>
              {rocketConfig?.name} Configuration
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'THRUST', value: rocketConfig?.thrust },
                { label: 'HEIGHT', value: rocketConfig?.height },
                { label: 'PAYLOAD (LEO)', value: rocketConfig?.payload_leo },
                { label: 'PAYLOAD (TLI)', value: rocketConfig?.payload_tli },
                { label: 'STAGES', value: rocketConfig?.stages },
                { label: 'FIRST FLIGHT', value: rocketData.firstFlight },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacecraft */}
        <div
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#22d3ee',
              marginBottom: 16,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            SPACECRAFT
          </h3>

          {selectedMission?.spacecraft.map((scId) => {
            const sc = ARTEMIS_SPACECRAFT[scId]
            if (!sc) return null
            return (
              <div key={sc.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                    {sc.name}
                  </div>
                  <span
                    style={{
                      ...getStatusStyle(sc.status),
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {sc.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontFamily: 'monospace' }}>
                  {sc.manufacturer || sc.type}
                </div>
                {sc.capabilities && (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {sc.capabilities.slice(0, 3).map((cap, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.6)',
                          marginBottom: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ color: '#22d3ee' }}>•</span>
                        {cap}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Systems Section */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          MISSION SYSTEMS
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {ARTEMIS_SYSTEMS.map((sys) => (
            <div
              key={sys.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(34, 211, 238, 0.15)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#22d3ee',
                  marginBottom: 8,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {sys.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8, lineHeight: 1.5 }}>
                {sys.description}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                {sys.importance}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Panels */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          KNOWLEDGE BASE
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ARTEMIS_KNOWLEDGE.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: 12,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(34, 211, 238, 0.15)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpandedKnowledge(expandedKnowledge === item.id ? null : item.id)}
                style={{
                  width: '100%',
                  padding: 16,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {item.title}
                </span>
                <span style={{ color: '#22d3ee', fontSize: 18 }}>
                  {expandedKnowledge === item.id ? '−' : '+'}
                </span>
              </button>
              {expandedKnowledge === item.id && (
                <div
                  style={{
                    padding: '0 16px 16px',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.6,
                  }}
                >
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
