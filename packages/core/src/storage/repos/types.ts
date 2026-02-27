export type MissionsRepo = {
  listAttempts(actorId: string): Promise<any[]>
  saveAttempt(actorId: string, attempt: any): Promise<void>
  markCompleted(actorId: string, missionId: string): Promise<void>
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
}
