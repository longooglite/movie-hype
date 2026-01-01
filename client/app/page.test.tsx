import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Page from './page'

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
		// @ts-expect-error assign global fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ ok: true, database: 'ok', redis: 'ok' }),
		})

		const qc = new QueryClient()
		render(
			<QueryClientProvider client={qc}>
				<Page />
			</QueryClientProvider>
		)

		await waitFor(() => {
			expect(screen.getByText(/Database:/i)).toBeInTheDocument()
			expect(screen.getByText(/Redis:/i)).toBeInTheDocument()
		})
	})
})
