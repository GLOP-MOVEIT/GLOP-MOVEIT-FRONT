import { describe, expect, it } from 'vitest'
import { commissionerRequests } from '@/data/commissionerRequests'

describe('commissionerRequests data', () => {
  it('contains requests with documents', () => {
    expect(commissionerRequests.length).toBeGreaterThan(0)
    expect(commissionerRequests[0].documents.length).toBeGreaterThan(0)
  })
})
