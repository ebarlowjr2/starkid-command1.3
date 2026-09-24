import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listLearningModules, getLessonBySlug, getSession, getUserProgressForModule } from '@starkid/core'

// Linux Lab landing (/learning/linux): lists the Linux Mission Training courses
// and launches the in-browser terminal lesson. Prefers database-backed modules
// (module_type 'linux', published) for governance + progress, but falls back to
// the registered lesson(s) so the page is usable even before the seed migration
// is applied or when Supabase is not configured (local dev).

const KNOWN_LINUX_LESSONS = ['linux-level-1-prepare-for-launch']

const levelLabel = (lvl) => {
  if (lvl === 'cadet') return 'Beginner'
  if (lvl === 'explorer') return 'Intermediate'
  if (lvl === 'specialist') return 'Advanced'
  if (lvl === 'operator') return 'Expert'
  return lvl || ''
}

export default function LinuxLabPage() {
  const [courses, setCourses] = useState([])
  const [progressById, setProgressById] = useState({})
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      let modules = []
      try {
        modules = await listLearningModules({ moduleType: 'linux', audience: 'learner' })
      } catch (e) {
        modules = []
      }

      const bySlug = new Map()
      for (const m of modules) {
        if (m.lessonSlug) {
          bySlug.set(m.lessonSlug, {
            id: m.id,
            title: m.title,
            description: m.description,
            lessonSlug: m.lessonSlug,
            estimatedMinutes: m.estimatedMinutes,
            level: m.level,
            xpReward: m.xpReward,
          })
        }
      }
      // Fallback: surface registered Linux lessons even without a DB row.
      for (const slug of KNOWN_LINUX_LESSONS) {
        if (!bySlug.has(slug)) {
          const lesson = getLessonBySlug(slug)
          if (lesson) {
            bySlug.set(slug, {
              id: lesson.id,
              title: lesson.title,
              description: lesson.summary,
              lessonSlug: lesson.slug,
              estimatedMinutes: lesson.estimatedMinutes,
              level: lesson.difficulty,
              xpReward: lesson.rewards?.xp,
            })
          }
        }
      }

      if (active) {
        setCourses([...bySlug.values()])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    async function loadProgress() {
      try {
        const session = await getSession()
        if (active) setIsAuthed(Boolean(session?.userId))
        if (!session?.userId) {
          if (active) setProgressById({})
          return
        }
        const entries = await Promise.all(
          courses.map(async (c) => [c.id, await getUserProgressForModule(c.id)])
        )
        if (active) setProgressById(Object.fromEntries(entries))
      } catch (e) {
        if (active) setProgressById({})
      }
    }
    if (courses.length) loadProgress()
    return () => {
      active = false
    }
  }, [courses])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono mb-2">
          LINUX LAB
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono">
          Learn Linux in a real in-browser terminal by preparing a spacecraft for launch.
          Missions are graded on the resulting system state, not the commands you type.
        </p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/30 text-cyan-200/70 font-mono">
            Loading Linux courses from Command…
          </div>
        ) : courses.length === 0 ? (
          <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/30 text-cyan-200/70 text-sm">
            No Linux courses available right now.
          </div>
        ) : null}

        {courses.map((course) => (
          <div key={course.lessonSlug} className="border border-cyan-600/50 rounded-lg p-4 bg-black/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-cyan-400 bg-cyan-900/40 px-2 py-0.5 rounded">Linux</span>
              <span className="text-xs text-cyan-200/70">{levelLabel(course.level)}</span>
              {course.estimatedMinutes ? (
                <span className="text-xs text-cyan-200/50">{course.estimatedMinutes} min</span>
              ) : null}
              {isAuthed && progressById[course.id]?.status === 'completed' ? (
                <span className="text-xs text-green-300 bg-green-900/30 px-2 py-0.5 rounded">
                  Completed{course.xpReward ? ` • +${course.xpReward} XP` : ''}
                </span>
              ) : isAuthed && progressById[course.id]?.status === 'in_progress' ? (
                <span className="text-xs text-yellow-200 bg-yellow-900/30 px-2 py-0.5 rounded">
                  In Progress
                </span>
              ) : null}
            </div>
            <div className="text-cyan-200 font-semibold">{course.title}</div>
            <div className="text-cyan-200/70 text-sm mt-1">{course.description}</div>
            <button
              onClick={() => nav(`/learning/lesson/${course.lessonSlug}`)}
              className="mt-3 text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded hover:text-cyan-200"
            >
              Start Course →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
