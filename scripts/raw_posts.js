//
// #region

  import * as avocado from "./modules/avocado.js"
  import * as avocado_blog from "./modules/avocado_blog.js"
  import * as avocado_g from "./modules/avocado_g.js"
  import Adapter from "./modules/adapter.js"

// #endregion
//
// #region GetParameters

  const { id, name } = avocado.getUrlParams()

// #endregion
//
// #region GetParentElement_AndPostObject

  avocado.assert(function() {
    return document.body
  })
  const parent = document.body
  // AVI
  avocado.validate(function() {
    return avocado_g.elementIsEmpty(parent)
  })

  const adapter = new Adapter()
  await adapter.init()
  const post = await adapter.getPost({ id, name })

  avocado.assert(function() {
    return post
  })

// #endregion
//
// #region BuildPost_FromPostObject

  const postElement = avocado_blog.buildPost({
    value: post,
    asPage: true
  })
  parent.appendChild(postElement)

// #endregion
//