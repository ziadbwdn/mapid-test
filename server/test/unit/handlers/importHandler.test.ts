import { describe, it, expect, vi } from 'vitest'
import importHandler from '../../../src/handlers/importHandler'

describe('importHandler', () => {
  it('calls runImport and returns result via sendSuccess', async () => {
    const mockResult = { imported: 100, updated: 20, snapshots_taken: 100 }
    const importSvc = { runImport: vi.fn().mockResolvedValue(mockResult) }
    const handler = importHandler(importSvc)

    const res = { json: vi.fn() } as any
    const req = {} as any

    await (handler.runImport as any)(req, res)
    expect(importSvc.runImport).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockResult
    })
  })
})
