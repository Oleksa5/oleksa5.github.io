//
// #region

  import * as avocado_g from "./modules/avocado_g.js"
  import * as common from "./common.js"
  import * as custom from "./custom.js"

// #endregion
//
// #region Data

  const data = await common.initData(window)

// #endregion
//
// #region InitCommon

  common.initTopSection(data.view)
  common.init(data)

// #endregion
//
// #region ConvertHeaderListsToText

  // TODO(bp+c): data.elements.document
  const lists = document.querySelectorAll(
    "body header ul, body header ol"
  )
  lists.forEach(function(list) {
    list.outerHTML =
      avocado_g.convertHtmlListToHtmlText(list)
  })

// #endregion
//
// #region BuildPostTimeline

  await common.loadNextPostTimelinePage(data)

// #endregion
//
// #region RunAfterScript

  // TODO(bp+n): region

  common.initAfterScript(data)
  custom.runAfterIndex?.()

// #endregion
//