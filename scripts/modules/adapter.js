import BackendAdapter from "./adapter_interface.js"
import * as avocado from "./avocado.js"
import { Query, Aggregator, Context } from "mingo"
import { $skip, $limit } from "mingo/operators/pipeline"
const context = Context.init({ pipeline: { $skip, $limit } })

// TODO(bp+n): PostInteractionSource
/**
 * @typedef { 'static' | 'dynamic' | 'test' } PostInteractionsSource
 */

/**
 * @implements {BackendAdapter}
 */
export default class DefaultAdapter extends BackendAdapter {
  //
  // #region Data

    postPath = "/blog/posts"
    manifestPath = "/blog/manifest.json"

    test = false

    postFileIndex
    manifest
    /** @type {Post[]} */
    posts

    // TODO(bp+c): assert posts are prebuilt
    postsBuilt = true
    postsInteractive = true
    interactionsSource = 'static'
   
  // #endregion
  //
  // #region Init

    /**
     */
    async init() {
      //
      // #region Data

        // TODO(bp+n): region
      
        if (this.posts) {
          return
        }
        this.posts = []
        this.manifest = await avocado.fetchJson(
          this.manifestPath
        )
      
      // #endregion
      //
      // #region GetPosts
      
        await this.#loadNextPostFile()
      
      // #endregion
      //
      // #region GetPostInteractions
      
        switch (this.interactionsSource) {
          case 'static':
            break;
          case 'dynamic':
            throw new Error("Not implemented")
            break;
          case 'test':
            // TODO(bp+mv)
            avocado.validate(function() {
              return this.test
            })
            for (const post of this.posts) {
              post.interactions = {
                likes: avocado.getRandomInt(0, 10),
                comments: avocado.getRandomInt(0, 10),
                shares: avocado.getRandomInt(0, 10),
                views: avocado.getRandomInt(10, 1000)
              }
            }
            break;
          default:
            break;
        }

      // #endregion
      //
    }

    #validateInitialized() {
      const that = this
      avocado.validate(function() {
        return that.posts
      })
    }
  
  // #endregion
  //
  // #region

    // TODO(bp+n): fetchNextPostFile
    /**
     * @returns {Promise<Post[]|undefined>}
     */
    async #loadNextPostFile() {
      const that = this
      avocado.assert(function() {
        return that.postFileIndex === undefined ||
          that.postFileIndex >= 1
      })
      if (this.postFileIndex == 1) {
        return
      }

      const nextIndex = this.postFileIndex ?
        this.postFileIndex - 1 :
        this.manifest.postFileIndex
      const nextPath = `${this.postPath}/posts-${nextIndex}.json`

      try {
        // TODO(bp+c): `let posts` outside `try` block scope
        const posts = await avocado.fetchJson(nextPath)
        this.posts.push(...posts)
        this.postFileIndex = nextIndex
        return posts
      } catch (error) {
        console.warn(
          `Warning: Failed to fetch post file: ${nextPath}`
        )
      }
    }

    #convertUrlQueryToMongoQuery(filter) {
      if (filter) {
        filter = avocado.convertUrlQueryToMongoQuery(
          filter, { tags: { type: 'Array' } }
        )
      }
      return filter
    }

    #filterPosts(posts, query, page = 1, limit = 10) {
      const cursor = query.find(posts)
        .sort({ publishedTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
      // TODO(bp+n)
      const filteredPosts = cursor.all()
      return filteredPosts
    }

    // TODO(bp+n)
    // TODO(bp+c+rm)
    async #getPostsUsingAggregator({ page = 1, limit = 10, filter } = {}) {
      this.#validateInitialized()

      filter = this.#convertUrlQueryToMongoQuery(filter)
      const aggregator = new Aggregator([
        ...(filter ? [{ $match: filter }] : []),
        { $sort: { publishedTime: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ], { context })
      const posts = aggregator.run(this.posts)
      if (!posts.length) {
        return
      }

      return posts
    }
  
  // #endregion
  //
  // #region Content

    /**
     * @override
     * @inheritdoc
     */
    async getPosts({ page = 1, limit = 10, filter } = {}) {
      this.#validateInitialized()

      const mongoFilter = this.#convertUrlQueryToMongoQuery(filter)
      const query = new Query(mongoFilter || {})

      let posts = this.#filterPosts(this.posts, query, page, limit)
      let nextBatch

      while (
        (limit == undefined || posts.length < limit) &&
        (nextBatch = await this.#loadNextPostFile())
      ) {
        const remaining = limit - posts.length
        const more = this.#filterPosts(nextBatch, query, 1, remaining)
        posts.push(...more)
      }

      return posts
    }

    // TODO(bp+urm)
    /* async getPost({ id, name }) {
      this.#validateInitialized()

      return id ?
        this.posts.find(post => post.id == id) :
        name ?
          this.posts.find(post => post.name == name) :
          undefined
    } */

    /**
     * @override
     * @inheritdoc
     */
    async getPost({ id, name }) {
      let filter = id ? { id } : name ?
        { name } : undefined
      if (!filter) {
        return
      }
      filter = new URLSearchParams(filter)
      const posts = await this.getPosts({
         filter: filter.toString()
      })
      avocado.assert(function() {
        return posts && posts.length == 1
      })
      return posts[0]
    }

  // #endregion
  //
  // #region Metrics
  
    /**
     * @override
     * @inheritdoc
     */
    async getPostCount({ filter } = {}) {
      this.#validateInitialized()

      const options = filter ?
        { limit: null, filter: filter } :
        undefined
      const count = this.manifest.postCount && !filter ?
        this.manifest.postCount :
        (await this.getPosts(options)).length

      return count
    }
  
  // #endregion
  //
  // #region Comments

    /**
     * @override
     * @inheritdoc
     */
    async getComments(postId) {
      throw new Error("Not implemented")
    }
  

  // #endregion
  //
  // #region UserInteraction

    /**
     * @override
     * @inheritdoc
     */
    async getPostInteractions({ postIds }) {
      return this.posts.filter(
        post => postIds.includes(post.id)
      )
    }
  
  // #endregion
  //
}