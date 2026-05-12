export type SourceStatus = {
  name: string
  ok: boolean
  count?: number
  error?: string
}

export type ServiceResult<T> = {
  data: T
  sources: SourceStatus[]
  warnings?: string[]
}
