export interface Movie {
	title: string
	tmdbId: number
	popularity: number
	hypeScore: number
	createdAt: string
}

// @TODO Define richer domain types used by analytics and UI:
// export interface BoxOfficeSnapshot { movieId: string; timestamp: string; domestic: number; international: number; budget: number }
// export interface CriticAggregate { movieId: string; timestamp: string; source: 'rt' | 'mc'; score: number; count: number }
// export interface SocialSignal { movieId: string; timestamp: string; source: 'reddit' | 'twitter' | 'youtube'; engagement: number; sentiment?: number }
// export interface TrailerImpression { movieId: string; timestamp: string; platform: 'youtube'; videoId: string; views: number; likes?: number; comments?: number }
// export interface HypeEventPayload { movie: { id: string; tmdbId: number; title: string }; snapshot: { id: string; movieId: string; timestamp: string; hypeScore: number; popularity: number } }
// @TODO Consider a common TimeSeriesPoint<T> generic to unify chart inputs on the client.
