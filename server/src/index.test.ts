import { buildServer } from './index'

vi.mock('@prisma/client', () => {
	class PrismaClient {
		$queryRaw = vi.fn().mockResolvedValue([1])
		// Minimal model mocks used by worker when not started in tests
		movie = { upsert: vi.fn() }
		historicalSnapshot = { create: vi.fn() }
	}
	return { PrismaClient }
})

vi.mock('ioredis', () => {
	return {
		default: class MockRedis {
			ping() {
				return Promise.resolve('PONG')
			}
		},
	}
})

describe('health endpoint', () => {
	it('returns ok when db and redis are reachable', async () => {
		process.env.NODE_ENV = 'test'
		const app = await buildServer()
		const res = await app.inject({ method: 'GET', url: '/health' })
		expect(res.statusCode).toBe(200)
		const body = res.json()
		expect(body).toEqual({ ok: true, database: 'ok', redis: 'ok' })
	})
})
