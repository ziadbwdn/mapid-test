import { describe, it, expect } from 'vitest'
import express from 'express'
import errorHandler from '../../src/middleware/errorHandler'
import notFound from '../../src/middleware/notFound'

describe('Smoke: Server Infrastructure', () => {
  it('Express app can be created and configured', () => {
    const app = express()
    expect(app).toBeDefined()
    expect(typeof app.use).toBe('function')
    expect(typeof app.get).toBe('function')
    expect(typeof app.post).toBe('function')
    expect(typeof app.listen).toBe('function')
  })

  it('Middleware chain includes errorHandler and notFound', () => {
    const app = express()
    app.use(notFound)
    app.use(errorHandler)
    const middleware = app._router?.stack || []
    const names = middleware.map((m: any) => m.name || m.handle?.name)
    expect(names).toContain('notFound')
    expect(names).toContain('errorHandler')
  })

  it('Express app can respond to requests', async () => {
    const app = express()
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' })
    })
    app.use(notFound)
    app.use(errorHandler)

    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('Returns 404 for undefined routes', async () => {
    const app = express()
    app.use(notFound)
    app.use(errorHandler)

    const supertest = (await import('supertest')).default
    const res = await supertest(app).get('/api/nonexistent')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})
