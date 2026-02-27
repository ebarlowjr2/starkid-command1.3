import { describe, it, expect } from 'vitest'
import { parseSolarMapParams } from '../solarMapUrl.js'

describe('solar map url', () => {
  it('parseSolarMapParams returns expected fields', () => {
    const params = parseSolarMapParams('?obj=c2025n1&date=2025-12-23&h=16&m=10')
    expect(params).toEqual({ obj: 'c2025n1', date: '2025-12-23', h: 16, m: 10 })
  })
})
