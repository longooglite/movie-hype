import type { Server as IOServer } from 'socket.io'
import type { PrismaClient } from '@prisma/client'
import type pino from 'pino'
import type Redis from 'ioredis'
import axios from 'axios'

type Deps = {
	io: IOServer
	prisma: PrismaClient
	logger: pino.Logger
	redis: Redis
}

export const startIngestor = ({ io, prisma, logger }: Deps) => {
	const tmdbKey = process.env.TMDB_API_KEY
	const intervalMs = 30_000

	const ingestOnce = async () => {
		try {
			// Basic example: fetch TMDB "trending" movies daily
			// @TODO Replace this demo TMDB ingestion with real multi-source ingestion (Reddit/Twitter/YouTube),
			//       including rate limits, retries, and persistence design appropriate for production.
			// @TODO Implement provider-specific fetchers:
			//       - Reddit: subreddit listing + search; dedupe by post/comment id; map engagement
			//       - Twitter/X: search by movie/title/hashtag; handle API pagination and rate limits
			//       - YouTube: video stats for official trailers; track views/likes/comments deltas over time
			// @TODO Add idempotent ingestion keys to avoid duplicates across retries (e.g., provider + externalId + timestamp bucket)
			// @TODO Add structured logging and metrics (success/fail counts per provider, latency, rate-limit occurrences)
			// @TODO Implement backfill mode (range-based ingestion) and a live tail mode; schedule via cron or queue
			// If no key provided, emit a mock event so the UI has a signal
			let movies: Array<{ id: number; title: string; popularity: number }> = []
			if (tmdbKey) {
				const res = await axios.get('https://api.themoviedb.org/3/trending/movie/day', {
					headers: { Authorization: `Bearer ${tmdbKey}` },
				})
				movies = (res.data?.results ?? []).slice(0, 5).map((m: any) => ({
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
				// @TODO Replace with real hype scoring model that combines multiple signals over time
				// @TODO Score inputs:
				//       - Social velocity (mentions/engagement per time window)
				//       - Trailer impression deltas (views, CTR proxy)
				//       - Critics/early reviews
				//       - Budget/genre weighting to normalize expectations
				// @TODO Output calibration:
				//       - Keep score bounded (0..100)
				//       - Provide confidence intervals or variance
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
				// @TODO Revisit event payload contract as features expand; keep events concise and documented
				// @TODO Version events (e.g., hype:v2) if payload shape evolves; add minimal server-side docs
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
