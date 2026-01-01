import axios from 'axios'
export const startIngestor = ({ io, prisma, logger }) => {
	const tmdbKey = process.env.TMDB_API_KEY
	const intervalMs = 30_000
	const ingestOnce = async () => {
		try {
			// Basic example: fetch TMDB "trending" movies daily
			// If no key provided, emit a mock event so the UI has a signal
			let movies = []
			if (tmdbKey) {
				const res = await axios.get('https://api.themoviedb.org/3/trending/movie/day', {
					headers: { Authorization: `Bearer ${tmdbKey}` },
				})
				movies = (res.data?.results ?? []).slice(0, 5).map((m) => ({
					id: Number(m.id),
					title: String(m.title ?? m.original_title ?? 'Untitled'),
					popularity: Number(m.popularity ?? 0),
				}))
			} else {
				movies = [{ id: 1, title: 'Example Movie', popularity: Math.random() * 100 }]
			}
			for (const m of movies) {
				// Upsert movie
				const movie = await prisma.movie.upsert({
					where: { tmdbId: m.id },
					update: { title: m.title },
					create: { tmdbId: m.id, title: m.title },
				})
				// Derive a naive hype score from popularity (placeholder)
				const hypeScore = Math.max(0, Math.min(100, m.popularity))
				// Insert historical snapshot
				const snapshot = await prisma.historicalSnapshot.create({
					data: {
						movieId: movie.id,
						hypeScore,
						popularity: Math.round(m.popularity),
					},
				})
				// Emit live event
				io.of('/events').emit('hype', {
					movie: { id: movie.id, tmdbId: movie.tmdbId, title: movie.title },
					snapshot,
				})
			}
		} catch (err) {
			logger.error({ err }, 'ingestor cycle failed')
		}
	}
	// Kick off immediately and then repeat
	ingestOnce()
	setInterval(ingestOnce, intervalMs)
}
