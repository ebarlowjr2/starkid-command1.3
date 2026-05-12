export type MissionsRepo = {
  listAttempts(actorId: string): Promise<any[]>
  saveAttempt(actorId: string, attempt: any): Promise<void>
  markCompleted(actorId: string, missionId: string): Promise<void>
  isCompleted(actorId: string, missionId: string): Promise<boolean>
  listCompleted(actorId: string): Promise<string[]>
}

export type SavedItemsRepo = {
  save(actorId: string, item: any): Promise<void>
  remove(actorId: string, itemId: string, type?: string): Promise<void>
  list(actorId: string, type?: string): Promise<any[]>
}

export type PreferencesRepo = {
  get(actorId: string): Promise<any>
  set(actorId: string, prefs: any): Promise<void>
}

export type StemProgressRepo = {
  markCompleted(actorId: string, completion: any): Promise<void>
  isCompleted(actorId: string, activityId: string): Promise<boolean>
  listCompleted(actorId: string): Promise<any[]>
}

export type ProfileRepo = {
  getProfile(actorId: string): Promise<any | null>
  saveProfile(actorId: string, profile: any): Promise<void>
  updateProfile(actorId: string, patch: any): Promise<any>
}

export class RepoNotEnabledError extends Error {
  constructor(message) {
    super(message)
    this.name = 'RepoNotEnabledError'
  }
}

export class NotEnabledRepo {
  async listAttempts() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async saveAttempt() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async markCompleted() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async isCompleted() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async listCompleted() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async save() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async remove() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async list() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async get() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async set() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async getProfile() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async saveProfile() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
  async updateProfile() {
    throw new RepoNotEnabledError('Repo not enabled yet')
  }
}
