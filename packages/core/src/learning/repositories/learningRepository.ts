import type { Lesson } from '../models/lesson'
import type { LessonSubmission } from '../models/submission'

export type LearningRepository = {
  listLessons: () => Lesson[]
  getLessonById: (id: string) => Lesson | null
  getLessonBySlug: (slug: string) => Lesson | null
  saveSubmission: (submission: LessonSubmission) => LessonSubmission
  saveDraftSubmission: (submission: LessonSubmission) => LessonSubmission
  getSubmissionByAttemptId: (attemptId: string) => LessonSubmission | null
}
