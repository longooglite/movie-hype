import { NORMALIZER_VALUES } from '@shared/consts/normalizerValues'

const normalizeMetric =
	(metricName: string) =>
	(metricValue: number): number => {
		return (
			((metricValue - NORMALIZER_VALUES[metricName as keyof typeof NORMALIZER_VALUES].MIN) /
				(NORMALIZER_VALUES[metricName as keyof typeof NORMALIZER_VALUES].MAX -
					NORMALIZER_VALUES[metricName as keyof typeof NORMALIZER_VALUES].MIN)) *
			NORMALIZER_VALUES[metricName as keyof typeof NORMALIZER_VALUES].WEIGHT
		)
	}

export const normalizeYoutubeViews = normalizeMetric('YOUTUBE_VIEWS')
export const normalizeRedditMentions = normalizeMetric('REDDIT_MENTIONS')
export const normalizeGoogleTrends = normalizeMetric('GOOGLE_TRENDS')
export const normalizeTwitterMentions = normalizeMetric('TWITTER_MENTIONS')
