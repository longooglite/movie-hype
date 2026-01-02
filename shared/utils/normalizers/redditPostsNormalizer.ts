import { SnootsSubmission } from '@shared/types/snoots'
import { normalizeRedditMentions } from '../normalizeMetric'

export const redditPostsNormalizer = (submissions: SnootsSubmission[]): number => {
	return normalizeRedditMentions(
		submissions.reduce((acc, currentPost) => {
			const engagement = currentPost.score * currentPost.upvoteRatio
			return acc + engagement
		}, 0)
	)
}
