/**
 * Represents the base properties shared by both
 * Posts and Comments in the Snoots response.
 */
interface SnootsBaseContent {
	id: string
	author: string
	subreddit: string
	score: number
	createdUtc: number // Unix timestamp
	permalink: string
	body?: string // The actual text content
}

/**
 * Interface for a Reddit Post (Submission).
 * High impact for Hype Scores due to 'title' and 'upvoteRatio'.
 */
export interface SnootsSubmission extends SnootsBaseContent {
	title: string
	selftext: string
	url: string
	numComments: number
	upvoteRatio: number
	over18: boolean
	isSelf: boolean // True if it's a text post
	stickied: boolean
}

/**
 * Interface for a Reddit Comment.
 * Useful for deep-diving into community sentiment.
 */
export interface SnootsComment extends SnootsBaseContent {
	parentId: string
	linkId: string // The ID of the submission this comment belongs to
	body: string
	replies?: SnootsComment[]
	depth: number
}

/**
 * Standard wrapper for Paginated Snoots requests (Listings).
 */
export interface SnootsListing<T> {
	data: T[]
	after?: string // Cursor for the next page
	before?: string // Cursor for the previous page
}
