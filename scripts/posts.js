//
// #region

  import * as avocado from "./modules/avocado.js"
  import * as avocado_blog from "./modules/avocado_blog.js"
  import Adapter from "./modules/adapter.js"
  import * as common from "./common.js"
  import * as custom from "./custom.js"

// #endregion
//
// #region Library

  // TODO(bp+mvm)
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
  function normalizeQuery(value) {
    if (!value) {
      return value
    }
    value = value.startsWith("?") ? value.slice(1) : value
    value = value.trim()
    return value
  }

  // TODO(bp+n): region Prepare, Init, Setup,
  // PreUpdate, BeforeUpdate
  // TODO(bp+n): region UpdateFieldValues,
  // UpdateValues
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
  async function updateFilter({ event, elements, state, adapter, query }) {
    //
    // #region Prepare

        // #section PreventDefault

      event?.preventDefault()

        // #section ValidateInputAndState

      avocado.assert(function() {
        return typeof query == 'string' || query === undefined
      })
      avocado.assert(function() {
        return typeof elements.filter.value == 'string' &&
          typeof elements.search.value == 'string'
      })

        // #section Log/Start

      if (avocado.config.debug.log) {
        avocado.log({
          meta: import.meta,
          fn: updateFilter,
          parameters: { event, elements, state, query },
          region: "Prepare",
          context: {
            event, elements, state, query
          },
          level: 1
        })  
      }

        // #section Data

      query = normalizeQuery(query)
      const isFromSearch = event?.target.id == 'search-form'

        // #section GuardClause

      if (state.filter == query) {
        return
      }
    
    // #endregion
    //
    // #region Update
    
        // #section UpdateData

      state.filter = query
      state.currentPage = 0

        // #section UpdateFieldValues

      elements.filter.value = query || ""
      if (!isFromSearch) {
        elements.search.value = ""
      }

        // #section UpdateHistory

      const unused_ = ""
      const markedQuery_ = query ?
        "?" + query : window.location.pathname
      window.history.replaceState(null, unused_, markedQuery_)

        // #section UpdateTimeline

      avocado.assert(function() {
        return !state.isLoadingPosts
      })
      elements.timeline.replaceChildren()
      if (query === undefined) {
        avocado.assert(function() {
          return isFromSearch && !elements.search.value
        })
        return
      }
      await common.loadNextPostTimelinePage({
        elements, state, adapter
      })
    
    // #endregion
    //
  }

// #endregion
//
// #region Data

  const query = window.location.search
  const data = await common.initData(window)
  const { elements, state, adapter } = data
  elements.searchForm = document.getElementById('search-form')
  elements.search = document.getElementById('search-input')
  elements.filterForm = document.getElementById('filter-form')
  elements.filterDropdown = document.getElementById('filter-dropdown')
  elements.filter = document.getElementById('filter-input')

// #endregion
//
// #region InitCommon

  common.initTopSection(data.view)
  common.init(data)

// #endregion
//
// #region UpdateFilter_OnSubmit

  elements.searchForm.addEventListener(
    "submit",
    async function(event) {
      await updateFilter({
        event,
        elements,
        state,
        adapter,
        query: elements.search.value ?
          `content[regex]=${elements.search.value}` :
          undefined
      })
    }
  )

  elements.filterForm.addEventListener(
    "submit",
    async function(event) {
      await updateFilter({
        event,
        elements,
        state,
        adapter,
        query: elements.filter.value
      })
    }
  )

// #endregion
//
// #region InitFilterInput
  
  elements.filter.addEventListener(
    'keydown',
    event => {
      if (event.code == 'Space' || event.code == 'Enter') {
        event.stopPropagation()
      }
    }
  )

  elements.filterDropdown.addEventListener(
    'sl-select',
    event => {
      const item = event.detail.item
      elements.filter.value = item.value
    }
  )

// #endregion
//
// #region BuildPostTimeline

  await updateFilter({
    event: undefined,
    elements,
    state,
    adapter,
    query: query || elements.filter.value
  })

// #endregion
//
// #region UpdateFilter_OnRequestClientSideNavigate

  document.addEventListener(
    "requestClientSideNavigate",
    async (event) => {
      await updateFilter({
        event: event.detail.originalEvent,
        elements,
        state,
        adapter,
        query: event.detail.url
      })
    }
  )

// #endregion
//
// #region RunAfterScript

  // TODO(bp+n): region

  common.initAfterScript(data)
  custom.runAfterPosts?.()

// #endregion
//