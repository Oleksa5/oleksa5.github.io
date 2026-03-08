// #library avocado-blog-for-gleam

import { marked } from "https://cdn.jsdelivr.net/npm/marked@15.0.7/+esm"
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm"

import * as avocado from "./avocado.js"
import * as avocado_g from "./avocado_g.js"
import BackendAdapter from "./adapter_interface.js"

/**
  @typedef BodySection
  @property {string} content
 */

/**
  @typedef ErrorSection
  Base: BodySection
  @property {"ErrorSection"} type
  @property {string} content
 */

/**
  @param {string} content 
  @returns {ErrorSection}
 */
function createErrorSection(content) {
  return {
    type: 'ErrorSection',
    content: content
  }
}

/**
  @param {object} options
  @param {HTMLDocument} options.document
  @param {string} options.specialization 
  @returns {HTMLElement}
 */
export function buildBodySection({ document, specialization }) {
  const article = document.createElement('article')
  article.classList.add('body-section')
  if (specialization) {
    article.classList.add(specialization + "-section")
  }
  return article
}

/**
  @param {HTMLDocument} document
  @param {ErrorSection} value 
  @returns {HTMLElement}
 */
export function buildErrorSection(document, value) {
  const section = buildBodySection({ 
    document, specialization: 'error'
  })
  const message = value.content || "Unspecified error"
  // TODO(bp+u): why it was without <p>,
  // but with it with `createBodySection('error')`
  // in `buildPostOf`. 
  // TODO(bp+t): if it works with `resolveHtml`
  section.innerHTML = `<p>${message}</p>`
  return section
}

/**
  @param {BackendAdapter} adapter
  @param {string} [query]
  Query string, with or without a leading question mark.
  @param {object} [options]
  @param {boolean} [options.unrestricted=true]
  TODO(bp+n): unrestrictedFilter
  @param {number} [options.page]
  @param {number} [options.limit]
  @returns {(Post|BodySection)[]|undefined}
 */
export async function getPosts(adapter, query, options = {}) {
  //
  // #region Library
  
    /**
     * @param {URLSearchParams} query 
     * @returns {object}
     */
    function validateQuery(query) {
      //
      // #region Data
      
        let errorMessage
        // #var property1, property2
        let p1, p2

      // #endregion
      //
      // #region ValidateNot_BothQueryParametersSpecified

        // TODO(bp+n): region

        if (query.has("tag") && query.has("tags")) {
          p1 = "tag", p2 = "tags"
        }

        /* TODO(bp+mv): trash or archive
          if (query.has("id") && query.has("name")) {
            p1 = "id", p2 = "name"
          } else if (query.has("id") && query.has("tags")) {
            p1 = "id", p2 = "tags"
          } else if (query.has("name") && query.has("tags")) {
            p1 = "name", p2 = "tags"
          } else if (query.has("tag") && query.has("tags")) {
            p1 = "tag", p2 = "tags"
          }   
        */
        var _commentFoldingFix

      // #endregion
      //
      // #region FormatErrorMessage
      
        if (p1) {
          const v1 = query.get(p1) 
          // TODO(bp+c): 'p2 == "tags"' instead
          // TODO(bp+t)
          const v2 = p2 != "tags" ?
            query.get(p2) : query.getAll(p2)

          errorMessage =
            `Both the post ${p1} and ${p2} were specified: ` +
              `${v1} and ${v2}.`
        }
      
      // #endregion
      //
      // #region ReturnValidationResult
      
        return {
          succeeded: !Boolean(errorMessage),
          message: errorMessage
        }
      
      // #endregion
      //
    }

  // #endregion
  //
  // #region ValidateInput
  
    avocado.validate(function() {
      return options.page === undefined ||
        options.page >= 1
    })
  
  // #endregion
  //
  // #region Parameters
  
    options = { ...options }
    options.unrestricted ??= true
  
  // #endregion
  //
  // #region CreateQueryObject_FromString

    // TODO(bp+c): use separate 'queryObject' variable
    // or 'queryString' parameter

    if (query) {
      query = new URLSearchParams(query)
      const validation = validateQuery(query)
      if (!validation.succeeded) {
        return [
          createErrorSection(validation.message)
        ]
      }
    }

  // #endregion
  //
  // #region GetPosts

    let posts
    
    if (query && (query.get("id") || query.get("name"))) {
      //
      // #region GetPost_ByIdOrName
      
        if (options.page == 1) {
          const post = await adapter.getPost({
            id: query.get("id"), name: query.get("name")
          })
          if (!post) {
            return [
              createErrorSection(
                `No post with the specified name was found: ` +
                  `${query.get("name")}.`
              )
            ]
          }
          posts = [ post ]
        }

      // #endregion
      //
    } else {
      //
      // #region GetPosts_AllOrFiltered
        //
        // #region CreateFilterObject_FromQuery

          let filter
          if (query) {
            // TODO(bp+c):
            // validate relevant query parameters now instead
            // of at the start
            if (options.unrestricted) {
              filter = new URLSearchParams(query)
              const keys = [ [ "tag", "tags" ] ]
              avocado.copyURLSearchParams(query, filter, keys)
              if (filter.has("tag")) {
                filter.delete("tag")
              }
            } else {
              filter = new URLSearchParams()
              const keys = [ "tags", [ "tag", "tags" ] ]
              avocado.copyURLSearchParams(query, filter, keys)
            }
          }

        // #endregion
        //
        // #region GetPosts
        
          posts = await adapter.getPosts({
            page: options.page,
            limit: options.limit,
            filter: filter?.toString()
          })

        // #endregion
        //
      // #endregion
      //
    }
  
  // #endregion
  //
  // #region GuardClause/PostsNotUndefined

    // TODO(bp+n): region
  
    if (!posts) {
      return
    }
  
  // #endregion
  //
  // #region FilterPosts

    // NOTE: outside adapter, seems more efficient
    posts = posts.filter(post => !post.hidden)

  // #endregion
  //
  // #region ReturnPosts
  
    return posts
  
  // #endregion
  //
}

/**
  @param {HTMLElement} section 
  @returns {void}
 */
export function initFolding(section) { 

    // #section Data
  
  const document = section.ownerDocument
  // TODO(bp+c): `section.tagName.toLowerCase() == 'header'`
  const header = section.matches("header") ?
    section : section.querySelector("header")
  const heading = header?.querySelector("h2, h3")
  const body = section.querySelector(".section-body") ?? (
    section.classList.contains("group-header-section") ?
      section.parentElement.querySelector(".section-body") :
      null
  )

    // #section GuardClause

  if (!header || !body) {
    if (avocado.config.debug.log) {
      avocado.log({
        meta: import.meta,
        fn: initFolding,
        parameters: { section },
        region: "SkipSection_WithNoheaderOrBody",
        context: { section, header, body },
        level: 1
      })  
    }
    return
  }
  avocado.assert(function() {
    return heading
  })
  avocado.assert(function() {
    return !header.querySelector(".section-arrow")
  })

    // section AddCollapsibleClass

  avocado.assert(function() {
    return !section.classList.contains('collapsible')
  })
  section.classList.add('collapsible')

    // #section AddArrowIndicator

  const arrow = document.createElement('span')
  arrow.className = 'section-arrow'
  arrow.textContent = "▾"
  header.append(arrow)

    // #section RestoreCollapsedState

  const sectionKey = `bodySectionState_${
    heading.textContent.trim()
  }`
  if (localStorage.getItem(sectionKey) == 'collapsed') {
    section.classList.add('collapsed')
  }

    // #section OnHeaderClick_ToggleCollapse

  header.addEventListener('click', () => {
    section.classList.toggle('collapsed')
    const collapsed =
      section.classList.contains('collapsed')
    localStorage.setItem(
      sectionKey,
      collapsed ? 'collapsed' : 'expanded'
    )
  })
}

/**
  @param {object} options
  @param {HTMLDocument} options.document
  @param {HTMLElement} options.post
  @param {PostInteractions} options.interactions
  @returns {void}
*/
export function buildActions({ document, post, interactions }) {
  const actions = document.createElement('div')
  actions.className = "button-container post-actions"

  // TODO(bp+c): var, #var

  // var buttonsData
  const bsd = [
    { 
      title: "Like", 
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thumbs-up-icon lucide-thumbs-up icon"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>'
    },
    { 
      title: "Comment", 
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-icon lucide-message-circle icon"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>'
    },
    { 
      title: "Share", 
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-forward-icon lucide-forward icon"><path d="m15 17 5-5-5-5"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg>'
    }
  ]

  // TODO(bp+rv)
  for (const bd of bsd) {
    const button = document.createElement('button')
    button.title = bd.title
    button.innerHTML = bd.svg
    const count = document.createElement('span')
    count.textContent = interactions ?
      interactions[bd.title.toLowerCase() + "s"] :
      ""
    button.appendChild(count)
    actions.appendChild(button)
  }

  // TODO(bp+da): OTU
  const sectionBody = post.querySelector(
    ".section-body"
  )
  sectionBody.appendChild(actions)
}

// GCA(2)
/*
  SYNOPSIS

  DESCRIPTION

  TODO
  document

  PARAMETER param?
  {
    STRUCT BuildPostParameters

    PROPERTY document
    Document

    PROPERTY value
    object:Post

    PROPERTY asPage
    boolean?
    
    PROPERTY sanitizer
    object
    object.sanitize(html) -> sanitizedHtml

    PROPERTY directory
    string:path?
  }

  NOTE

  EXAMPLE

  EXCEPTION

  OUTPUT
  HTMLElement
*/
export function buildPost(param) {
  //
  // #region ResolveParameters

    const post = param.value
    param = param || {}
    const param_directory = param.directory || ""
    const document = param.document || window.document
    const sanitizer = param.sanitizer || DOMPurify

  // #endregion
  //
  // #region CreateElement/Post (Article)

    const article = buildBodySection({ document })

  // #endregion
  //
  // #region ReturnRawContentIfRawSpecified

    if (param.asPage) {
      avocado.validate(function() {
        return post.asPage
      })
      const content = sanitizer.sanitize(
        marked.parse(post.content)
      )
      avocado.assert(function() {
        return typeof content == 'string'
      })
      article.innerHTML = content
      return article
    }

  // #endregion
  //
  // #region BuildChildElement/Title (H3)

    if (post.title) {
      const header = document.createElement('header')
      header.classList.add('heading3')
      const title = document.createElement('h3')
      title.textContent = post.title
      header.appendChild(title)
      article.appendChild(header)
    }

  // #endregion
  //
  // #region BuildChildGroupElement/SectionBody (Div)
  
    // TODO(bp+n): BuildChildrenGroupElement

    const sectionBody = document.createElement('div')
    sectionBody.className = "section-body"
    article.appendChild(sectionBody)

  // #endregion
  //
  // #region BuildChildElement/PublishedTime (A, Time)

    // #var linkOnDate
    const dl = document.createElement('a')
    dl.href = post.name ? 
      "/pages/posts?name=" + post.name :
      "/pages/posts?id=" + post.id
    const time = document.createElement('time')
    time.setAttribute('datetime', post.publishedTime)
    const date = new Date(post.publishedTime)
    time.textContent = date.toLocaleDateString()
    dl.appendChild(time)
    sectionBody.appendChild(dl)

  // #endregion
  //
  // #region BuildChildElement/Tags (P, A)

    if (post.tags && post.tags.length) {
      // #var tagParagraph
      const kp = document.createElement('p')
      post.tags.forEach(function(tag, index) {
        const l = document.createElement('a')
        // TODO(bp): fix `tag` filter or remove
        /* l.href = "/pages/posts?tag=" + tag */
        l.href = "/pages/posts?tags[in]=" + tag
        l.textContent = "#" + tag
        kp.appendChild(l)

        if (index < post.tags.length - 1) {
          kp.appendChild(document.createTextNode(" "))
        }
      })
      sectionBody.appendChild(kp)
    }

  // #endregion
  //
  // #region BuildChildElement/Content_FromParsedMarkdown (Element)

    if (post.asPage) {
      //
      // #region BuildDescriptionAsContent

        if (post.description) {
          // #var descriptionParagraph
          const dp = document.createElement('p')
          dp.innerHTML = post.description
          sectionBody.appendChild(dp)
        }

      // #endregion
      //
      // #region BuildContentLink

        // #var contentlink
        const cl = document.createElement('a')
        cl.href = post.name ? 
          "/pages/raw-posts?name=" + post.name :
          "/pages/raw-posts?id=" + post.id
        cl.textContent = "... See the post's content"
        sectionBody.appendChild(cl)

      // #endregion
      //
    } else {
      //
      // #region ParseAndBuildMarkdownContent

        sectionBody.insertAdjacentHTML(
          'beforeend',
          sanitizer.sanitize(
            marked.parse(post.content)
          )
        )

      // #endregion
      //
    }

  // #endregion
  //
  // #region BuildChildElement/Image (Img)

    if (post.image) {
      const image = document.createElement('img')
      // TODO: collapse "/"
      image.src = param_directory + "/" + post.image
      image.alt = post.title + " image"
      sectionBody.appendChild(image)
    }

  // #endregion
  //
  // #region BuildChildElement/Actions (Div)
  
    if (post.interactions) {
      buildActions({
        document,
        post: article,
        interactions: post.interactions
      })
    }

  // #endregion
  //
  // #region ReturnArticle

    // TODO(c+rm)
    avocado.assert(function() {
      return article instanceof
        document.defaultView.HTMLElement
    })

    return article

  // #endregion
  //
}

// TODO(bp+d): update
// TODO(bp+n):
// region ReferencePostElement, GetPostElement
/** 
 * @param {object} options
 * @param {(Post|BodySection)[]} options.value
 * @param {boolean} options.postsBuilt
 * @param {boolean} options.postsInteractive
 * @returns {DocumentFragment}
 */
export function buildPostTimeline({
  document = window.document,
  value,
  postsBuilt,
  postsInteractive
}) {
//
// #region Data

  const timelineFragment = new DocumentFragment()

// #endregion
//
// #region GuardClause

  if (!value.length) {
    return timelineFragment
  }

// #endregion
//
// #region ForEachBodySection

  for (const section of value) {
  //
  // #region BuildErrorSection
  
    if (section.type == "ErrorSection") {
      timelineFragment.appendChild(
        buildErrorSection(document, section)
      )
      continue
    }
    
  // #endregion
  //
  // #region BuildPost
    
    const post = section
    let postElement

    if (postsBuilt) {
    //
    // #region CompletePreBuiltPost

        // AssignPreBuiltPost

      const container = document.createElement('div')
      container.innerHTML = post.htmlContent.trim()

        // ReferencePostElement

      postElement = container.firstElementChild
      if (!postElement) {
        continue
      }

    // #endregion
    //
    } else {
    //
    // #region BuildPostDynamically

      postElement = buildPost({
        document, value: post, blogDirectory: "/blog"
      })

    // #endregion
    //
    }

  // #endregion
  //
  // #region BuildPost/Folding
  
    initFolding(postElement)
  
  // #endregion
  //
  // #region BuildPost/Actions

    if (postsInteractive) {
      buildActions({
        document,
        post: postElement,
        interactions: post.interactions
      })
    }
  
  // #endregion
  //
  // #region BuildPost/AppendToTimelineFragment

    timelineFragment.appendChild(postElement)

  // #endregion
  //
  }

// #endregion
//
// #region ReturnTimelineFragment

  return timelineFragment

// #endregion
//
}

// #function buildPostElements_FromPostData
/*
  SYNOPSIS

  DESCRIPTION

  TODO
  document

  PARAMETER

  NOTE

  EXAMPLE

  EXCEPTION

  OUTPUT
*/
export async function buildPosts({
  document, adapter, query, page, pagePostCount
}) {

    // #section GetPostsObjects

  const posts = await getPosts(
    adapter,
    query,
    { page: page, limit: pagePostCount }
  )
  if (!posts) {
    return
  }

    // #section BuildPosts_FromPostsObject

  const timelineFragment = buildPostTimeline({
    document: document,
    value: posts,
    postsBuilt: adapter.postsBuilt,
    postsInteractive: adapter.postsInteractive
  })

    // #section ReturnTimelineFragment

  return timelineFragment
}