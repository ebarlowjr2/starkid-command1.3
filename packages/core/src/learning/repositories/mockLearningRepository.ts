import type { Lesson } from '../models/lesson'
import type { LessonSubmission } from '../models/submission'
import type { LearningRepository } from './learningRepository'
import { launchFuelRatioLesson } from '../seeds/launchFuelRatioLesson'

const lessons: Lesson[] = [launchFuelRatioLesson]
const submissions = new Map<string, LessonSubmission>()

export const mockLearningRepository: LearningRepository = {
  listLessons() {
    return lessons.slice()
  },
  getLessonById(id: string) {
    return lessons.find((lesson) => lesson.id === id) || null
  },
  getLessonBySlug(slug: string) {
    return lessons.find((lesson) => lesson.slug === slug) || null
  },
  saveSubmission(submission: LessonSubmission) {
    submissions.set(submission.attemptId, submission)
    return submission
  },
  saveDraftSubmission(submission: LessonSubmission) {
    submissions.set(submission.attemptId, submission)
    return submission
  },
  getSubmissionByAttemptId(attemptId: string) {
    return submissions.get(attemptId) || null
  },
}
