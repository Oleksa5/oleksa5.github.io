/**
 * [class AvocadoWebsites/Post-0.2.0]
 * @typedef {object} Post
 * @property {string} [id]
 * The unique identifier of the post.
 * @property {string} [name]
 * The human-readable, URL-safe identifier
 * of the post.
 * @property {string} [title]
 * @property {string} [author]
 * @property {string} [publishedTime]
 * The date and time the post was published,
 * in ISO 8601 UTC format.
 * @property {PostStatus} [status=published]
 * @property {string} [summary]
 * @property {string} [content]
 * @property {string} [html]
 * @property {string[]} [tags]
 * @property {boolean} [asPage=false]
 * Whether to render the post's content as
 * a separate web page.
 * @property {boolean} [hidden=false]
 * @property {string} [image]
 * The URL of the featured image used in
 * various contexts.
 * @property {Attachment[]} [attachments]
 * @property {Comment[]} [comments]
 * @property {PostInteractions} [interactions]
 */

/**
 * @typedef { 'draft' | 'published' | 'archived' } PostStatus
 */

/**
 * @typedef {object} Comment
 * @property {string} post
 * The ID of the post the comment is linked
 * to.
 * @property {string} author
 * @property {string} publishedTime
 * The date and time the comment was published,
 * in ISO 8601 UTC format.
 * @property {string} content
 * @property {CommentStatus} status
 * The moderation status of the comment.
 */

// TODO(bp+n): CommentModerationStatus
// TODO(bp+c): create and use ModerationStatus
/**
 * @typedef { 'approved' | 'pending' } CommentStatus
 */
 
/**
 * Interaction data of readers for a post.
 * @typedef {object} PostInteractions
 * @property {number} [likes=0]
 * @property {number} [comments=0]
 * @property {number} [shares=0]
 * @property {number} [views=0]
 */

/**
 * @interface
 */
export default class BackendAdapter {
  
    // Content

  /**
   * Gets a paginated list of posts.
   * @param {object} [options]
   * @param {number} [options.page=1]
   * The page number to retrieve.
   * @param {number} [options.limit=10]
   * The maximum number of posts to return per page.
   * @param {string} [options.filter]
   * A URL query string to filter posts by their
   * properties.
   * @returns {Promise<Post[]|undefined>}
   */
  async getPosts({ page = 1, limit = 10, filter } = {}) {
    throw new Error("Not implemented")
  }

  /**
   * Gets a single post by its ID or name.
   * @param {object} options
   * @param {string|number} [options.id]
   * @param {string} [options.name]
   * @returns {Promise<Post|undefined>}
   */
  async getPost({ id, name }) {}

  async createPost(data) {}
  async updatePost(id, data) {}
  async deletePost(id) {}

    // Metrics

  /**
   * @param {string} filter
   * @returns {number}
   */
  async getPostCount({ filter } = {}) {}

  async getPostMetrics({ filter } = {}) {}

    // Comments
  
  /**
   * Gets comments of a post.
   * @param {string|number} postId 
   * @returns {Promise<Comment[]>}
   */
  async getComments(postId) {
    throw new Error("Not implemented")
  }

  async addComment(postId, data) {}
  async deleteComment(commentId) {}

  // User interaction

  /**
   * Fetches the reader post interaction data
   * for a list of post IDs.
   * @param {{postIds: (string|number)[]}} options
   * @returns {Promise<{[postId: string]: PostInteractions}>}
   * A map of post IDs to their interaction data,
   * or `undefined` if post interactions are not
   * supported.
   */
  async getPostInteractions({ postIds }) {
    throw new Error("Not implemented")
  }

  async likePost(id, userId) {}
  async unlikePost(id, userId) {}
  async bookmarkPost(id, userId) {}
  async unbookmarkPost(id, userId) {}
  async sharePost(postId, userId, options) {}

    // Auth

  async login(credentials) {}
  async logout() {}
  async getCurrentUser() {}
  async updateUserProfile(data) {}

    // Custom
    
  // TODO(bp+n): param, params, args, data, options
  async callCustomAction(name, param) {}
}