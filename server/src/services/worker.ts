import type { Server as IOServer } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import type pino from "pino";
import type Redis from "ioredis";
import axios from "axios";

type Deps = {
	io: IOServer;
	prisma: PrismaClient;
	logger: pino.Logger;
	redis: Redis;
};

export const startIngestor = ({ io, prisma, logger }: Deps) => {
	const tmdbKey = process.env.TMDB_API_KEY;
	const intervalMs = 30_000;

	const ingestOnce = async () => {
		try {
			// Basic example: fetch TMDB "trending" movies daily
			// If no key provided, emit a mock event so the UI has a signal
			let movies: Array<{ id: number; title: string; popularity: number }> = [];
			if (tmdbKey) {
				const res = await axios.get(
					"https://api.themoviedb.org/3/trending/movie/day",
					{ headers: { Authorization: `Bearer ${tmdbKey}` } }
				);
				movies = (res.data?.results ?? []).slice(0, 5).map((m: any) => ({
					id: Number(m.id),
					title: String(m.title ?? m.original_title ?? "Untitled"),
					popularity: Number(m.popularity ?? 0)
				}));
			} else {
				movies = [
					{ id: 1, title: "Example Movie", popularity: Math.random() * 100 }
				];
			}

			for (const m of movies) {
				// Upsert movie
				const movie = await prisma.movie.upsert({
					where: { tmdbId: m.id },
					update: { title: m.title },
					create: { tmdbId: m.id, title: m.title }
				});

				// Derive a naive hype score from popularity (placeholder)
				const hypeScore = Math.max(0, Math.min(100, m.popularity));

				// Insert historical snapshot
				const snapshot = await prisma.historicalSnapshot.create({
					data: {
						movieId: movie.id,
						hypeScore,
						popularity: Math.round(m.popularity)
					}
				});

				// Emit live event
				io.of("/events").emit("hype", {
					movie: { id: movie.id, tmdbId: movie.tmdbId, title: movie.title },
					snapshot
				});
			}
		} catch (err) {
			logger.error({ err }, "ingestor cycle failed");
		}
	};

	// Kick off immediately and then repeat
	ingestOnce();
	setInterval(ingestOnce, intervalMs);
};


