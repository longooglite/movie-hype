import { jsx as _jsx } from 'react/jsx-runtime'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Page from './page'
import { vi, describe, it, expect } from 'vitest'
vi.mock('socket.io-client', () => ({
	io: () => ({
		on: () => {},
		off: () => {},
		close: () => {},
	}),
}))
describe('Page', () => {
	it('renders health info', async () => {
		// Mock fetch for health
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ ok: true, database: 'ok', redis: 'ok' }),
		})
		const qc = new QueryClient()
		render(_jsx(QueryClientProvider, { client: qc, children: _jsx(Page, {}) }))
		await waitFor(() => {
			expect(screen.getByText(/Database:/i)).toBeInTheDocument()
			expect(screen.getByText(/Redis:/i)).toBeInTheDocument()
		})
	})
})
