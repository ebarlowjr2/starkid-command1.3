import type { Lesson } from '../models/lesson'
import type { LessonSubmission } from '../models/submission'
import type { LearningRepository } from '../repositories/learningRepository'
import { mockLearningRepository } from '../repositories/mockLearningRepository'

let repository: LearningRepository = mockLearningRepository

export function setLearningRepository(repo: LearningRepository) {
  repository = repo
}

export function listLessons() {
  return repository.listLessons()
}

export function listLessonsByModuleType(moduleType: Lesson['moduleType']) {
  return repository.listLessons().filter((lesson) => lesson.moduleType === moduleType)
}

export function getLessonById(id: string) {
  return repository.getLessonById(id)
}

export function getLessonBySlug(slug: string) {
  return repository.getLessonBySlug(slug)
}

export function createSubmission(submission: LessonSubmission) {
  return repository.saveSubmission({
    ...submission,
    status: submission.status || 'submitted',
    submittedAt: submission.submittedAt || new Date().toISOString(),
  })
}

export function saveDraftSubmission(submission: LessonSubmission) {
  return repository.saveDraftSubmission({
    ...submission,
    status: submission.status || 'draft',
  })
}

export function getSubmissionByAttemptId(attemptId: string) {
  return repository.getSubmissionByAttemptId(attemptId)
}
