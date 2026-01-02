import { NORMALIZER_VALUES } from '@shared/consts/normalizerValues'

interface MockDataForMetrics {
	MIN: number
	MAX: number
}
const generateMockDataForMetrics =
	(metricName: string) =>
	(numberOfMocks: number): MockDataForMetrics[] => {
		const metricMax = NORMALIZER_VALUES[metricName as keyof typeof NORMALIZER_VALUES].MAX
		const metricMin = NORMALIZER_VALUES[metricName as keyof typeof NORMALIZER_VALUES].MIN
		return Array.from({ length: numberOfMocks }, () => {
			return {
				MIN: Math.random() * (metricMax - metricMin) + metricMin,
				MAX: Math.random() * (metricMax - metricMin) + metricMin,
			}
		})
	}

export const mockRedditPosts = generateMockDataForMetrics('REDDIT_POSTS')
export const mockYoutubeViews = generateMockDataForMetrics('YOUTUBE_VIEWS')
export const mockGoogleTrends = generateMockDataForMetrics('GOOGLE_TRENDS')
export const mockTwitterMentions = generateMockDataForMetrics('TWITTER_MENTIONS')
