// #library avocado-for-gleam
//
// #region

  // TODO(bp+urm)
  /* import * as jsyaml from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm" */
  import { update } from "mingo"
  import * as avocado_g from "./avocado_g.js"

  import qs from "qs"

// #endregion
//
// #region Config

  export const config = {
    debug: {
      assert: true,
      log: true,
      logLevel: 1
    }
  }

// #endregion
//
// #region Basic/Validate

  // #docsourced AvocadoScripts/lib/core/basic/Validate/validate-0.1
  /*
    SYNOPSIS
    Validate a condition is true.

    DESCRIPTION
    If a condition evaluates to 'false',
    throws an exception with a message
    stating a failed validation.

    PARAMETER callback
    function() -> boolean

    EXCEPTION
    Condition evaluates to 'false'.

    OUTPUT
    None
  */
  export function validate(callback) {
    if (!callback()) {
      throw new Error(
        "Validation has failed: " + callback
      )
    }
  }

  // #docsourced AvocadoScripts/lib/core/basic/Validate/assert-0.1
  /*
    SYNOPSIS
    Assert a condition is true.

    DESCRIPTION
    If 'config.debug.assert' evaluates
    to 'true' and a condition evaluates
    to 'false', throws an exception with
    a message stating a failed assertion.

    PARAMETER callback
    function() -> boolean

    EXCEPTION
    Condition evaluates to 'false'.

    OUTPUT
    None
  */
  export function assert(callback) {
    if (config.debug.assert && !callback()) {
      throw new Error(
        "Assertion has failed: " + callback
      )
    }
  }

// #endregion
//
// #region Basic/IO

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
  export function log({ meta, localPath, fn, parameters, region, context, level }) {
    if (level <= config.debug.logLevel) {
      localPath = localPath ?
        `${localPath}/${fn.name}` :
        fn.name
      console.log(
        `${(new URL(meta.url)).pathname}/` +
        `${localPath}(${Object.keys(parameters)})/` +
        `${region}:`
      )
      console.log(context)
      console.log("")
    }
  }

// #endregion
//
// #region Math

  /*
    SYNOPSIS

    DESCRIPTION

    TODO
    document

    PARAMETER min
    Default: 0
    Minimum number, inclusive.

    PARAMETER max
    Default: output of 'maxSafeInteger'
    Maximum number, exclusive.

    NOTE

    EXCEPTION

    OUTPUT
  */
  export function getRandomInt(min, max) {
    var min = min !== undefined ? min : 0
    var max = max !== undefined ? max : Number.MAX_SAFE_INTEGER

    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min) + min)
  }

// #endregion
//
// #region Parse

  /**
    @param {string} value
    @returns {any}
   */
  function parseValue(value) {
    if (typeof value !== "string") {
      return value
    }

    if (value === "true") {
      return true
    }
    if (value === "false") {
      return false
    }
    if (value === "null") {
      return null
    }
    if (value === "undefined") {
    // TODO(bp+w)
      throw "Unsupported string value: \"undefined\""
    }

    /* NOTE(gpt) RegexUseReasons
       Regex is used instead of Number() or plain parseFloat because:
        - Number() accepts hex, binary, Infinity, and NaN literals we do not want
        - Number() coerces "" or whitespace into 0, which is misleading
        - parseFloat() alone is too permissive, parsing prefixes like "123abc"
        - We want to allow only decimal and scientific notation, nothing else
        - Explicit regex validation makes the accepted grammar transparent and predictable
     */

    /* NOTE(gpt) NumberRegexComponents
       Regex components for numeric parsing:
        - ^ and $ anchor the match to the full string
        - [-+]? allows an optional leading sign
        - \d+(\.\d*)? matches whole numbers and decimals with optional trailing dot
        - |\.\d+ matches decimals like .25 without a leading digit
        - ([eE][-+]?\d+)? matches optional scientific notation
       This combination enforces a strict decimal + exponent grammar and rejects junk input.
     */

    var _commentFoldingFix

    // TODO(bp+rv): regex
    if (/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(value)) {
      const num = parseFloat(value)
      assert(function() {
        return !Number.isNaN(num)
      })
      if (isFinite(num)) {
        return num
      }
    }
    
    return value
  }

// #endregion
//
// #region Web/Fetch

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
  export async function _fetch(url) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `Network response is not successful: ${response.status}`
      )
    }
    return response
  }

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
  export async function fetchText(url) {
    return (await _fetch(url)).text()
  }

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
  export async function fetchJson(url) {
    return (await _fetch(url)).json()
  }
  
  // GCA(2)
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
  export async function loadYaml(url) {
    return jsyaml.load(
      (await _fetch(url + ".yaml")).text()
    )
  }

// #endregion
//
// #region Web/Url

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
  export function getUrlParam(key, view = window) {
    const query_ = new URLSearchParams(
      view.location.search
    )
    return query_.get(key)
  }

  // #function getViewUrlQueryParams_AsPlainObject
  // GA
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
  export function getUrlParams(view = window) {
    return Object.fromEntries(
      new URLSearchParams(view.location.search).entries()
    )
  }

  // #function setViewUrlQueryParam
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
  export function setUrlParam(key, value, defaultValue, view = window) {
    const url = new URL(view.location)
    if (value !== defaultValue) {
      url.searchParams.set(key, value)
    } else {
      url.searchParams.delete(key)
    }
    const unused_ = ""
    view.history.replaceState(null, unused_, url)
  }
 
  /**
    @param {URLSearchParams} source
    @param {URLSearchParams} destination
    @param {string | string[]} keys
    @example
    // Copy 'a' parameter of 's' to 'd'.
    copyURLSearchParams(s, d, "a")
    // Copy 'a' and 'b' parameters of 's' to 'd'.
    copyURLSearchParams(s, d, [ "a", "b" ])
    // Copy 'a' and 'b' parameters of 's' to 'd' as 'a' and 'c'.
    copyURLSearchParams(s, d, [ "a", [ "b", "c" ] ])
    @returns {void}
   */
  export function copyURLSearchParams(source, destination, keys) {
    validate(function() {
      return keys
    })

    keys = [].concat(keys)

    for (var i = 0; i < keys.length; i++) {
      const key = keys[i]
      let sourceKey, destinationKey
      if (Array.isArray(key)) {
        sourceKey = key[0], destinationKey = key[1]
      } else {
        destinationKey = sourceKey = key
      }
      if (!source.has(sourceKey)) {
        continue
      }

      for (const value of source.getAll(sourceKey)) {
        destination.append(destinationKey, value)
      }
    }
  }

  /**
    @param {string | URLSearchParams} query
    @param {object} scheme
    @returns {object}
   */
  export function convertUrlQueryToMongoQuery(query, scheme) {
    //
    // #region Library
    
      const mongoOperators = new Set([
        'gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'in', 'nin',
        'all', 'exists', 'regex', 'options'
      ])
      
      const arrayOperators = new Set([ 'in', 'nin', 'all' ])

      // #function convert_QSQueryObject_ToMongoDBQueryObject
      /**
        @param {object} object
        @param {object} scheme
        @returns {object}
       */
      function _convertQueryObjectToMongoQuery(object, scheme) {
        //
        // #region ConvertNonObject
        
          if (typeof object == 'string') {
            return parseValue(object)
          }
          if (typeof object != 'object' || object === null) {
            return object
          }
          if (Array.isArray(object)) {
            return object.map(
              item => {
                return _convertQueryObjectToMongoQuery(item)
              }
            )
          }

        // #endregion ConvertNonObject
        //
        // #region ConvertObject
        
          const output = {}
          for (const [ key, value ] of Object.entries(object)) {
            //
            // #region Data
            
              let _key = key
              let _value = value
              let subScheme
                        
            // #endregion
            //
            // #region ProcessEntry

              if (mongoOperators.has(key)) {
                //
                // #region ProcessOperatorEntry
                
                  _key = "$" + key
                  subScheme = scheme

                  if (typeof value == 'string') {
                    
                    if ((scheme && scheme.type == 'Array') ||
                        arrayOperators.has(key)) {

                      _value = value.split(",")
                      subScheme = undefined
                    }
                  }

                // #endregion ProcessOperatorEntry
                //
              } else {
                //
                // #region ProcessNonOperatorEntry
                
                  subScheme = scheme ? scheme[key] : undefined

                  if (typeof value == 'string' &&
                      subScheme && subScheme.type == 'Array') {

                    _value = value.split(",")
                    subScheme = undefined
                  }
                
                // #endregion ProcessNonOperatorEntry
                //
              }
            
            // #endregion ProcessEntry
            //
            // #region ConvertEntry
            
              output[_key] = _convertQueryObjectToMongoQuery(
                _value, subScheme
              )

            // #endregion
            //
          }
          return output
        
        // #endregion ConvertObject
        //
      }
    
    // #endregion
    //
    // #region

      // TODO(bp+n)
      // [_convertQueryObjectToMongoQuery/ParseObject]:
      // _key, _value

      // TODO(bp+n) [GuardClause]:
      // GuardCode, DefineGuardClause

      // TODO(bp+c+pih) [GuardClause]

    // #endregion
    //
    // #region GuardClause
      
      validate(function() {
        return typeof query == 'string' ||
          query instanceof URLSearchParams
      })

    // #endregion
    //
    // #region ConvertQuery
      
      if (query instanceof URLSearchParams) {
        query = query.toString()
      }
      const parsed = qs.parse(query, {
        ignoreQueryPrefix: true,
        depth: 10,
      })

      return _convertQueryObjectToMongoQuery(parsed, scheme)

    // #endregion
    //
  }
  
// #endregion
//
// #region

    // Web/Storage

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
  function getLocalStorageItem(key, view = window) {
    const value = view.localStorage.getItem(key)
    if (value === null) {
      return
    }
    return JSON.parse(value)
  }

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
  function setLocalStorageItem(key, value, view = window) {
    view.localStorage.setItem(
      key, JSON.stringify(value)
    )
  }

  const useUrlQueryForSiteSettings = false

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
  function getSiteSetting(key, view = window, { parseUrl } = {}) {
    let value
    if (useUrlQueryForSiteSettings) {
      value = getUrlParam(key, view)
      if (value === null) {
        value = undefined 
      } else if (parseUrl) {
        value = JSON.parse(value)
      }
    } else {
      value = getLocalStorageItem(key, view)
    }
    return value
  }

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
  function setSiteSetting(
    key, value, defaultValue, view = window, { parseUrl } = {}
  ) {
    if (useUrlQueryForSiteSettings) {
      if (parseUrl) {
        value = JSON.stringify(value)
        defaultValue = JSON.stringify(defaultValue)
      }
      setUrlParam(key, value, defaultValue, view)
    } else {
      setLocalStorageItem(key, value, view)
    }
  }

// #endregion
//
// #region Web/InitSiteSetting

  // #function updateAndListenBooleanSetting
  /*
    SYNOPSIS

    DESCRIPTION

    TODO
    document

    PARAMETER param
    {
      PROPERTY name
      string
      The name of the site setting to initialize.
      A control element's ID is formed by adding
      "-checkbox" or "-switch" to the name.

      PROPERTY defaultValue

      PROPERTY onUpdate?

      PROPERTY view?
      Default: window
    }

    NOTE

    EXAMPLE

    EXCEPTION

    OUTPUT
  */
  export function initBooleanSetting(param) {
    //
    // #region ValidateInput
    
      validate(function() {
        return param.name && param.defaultValue !== undefined
      })
    
    // #endregion
    //
    // #region Library
    
      const view = param.view || window
      const document = view.document.documentElement

      const getElement = (controlType) =>
        view.document.getElementById(
          `${param.name}-${controlType}`
        )

      // #function updateDocumentElementClassList
      function updateClassList(value) {
        if (value) {
          document.classList.add(param.name)
        } else {
          document.classList.remove(param.name)
        }
      }

    // #endregion
    //
    // #region GetControlElement_AndResolveSettingValue
    
      const control = getElement("checkbox") ||
        getElement("switch")
      const controlData = computeCustomControlData(control)

      const value_ = getSiteSetting(
        param.name, view, { parseUrl: true }
      )
      const value = value_ !== undefined ?
        value_ : param.defaultValue

    // #endregion
    //
    // #region UpdateControlAndClassList

      control.checked = value
      updateClassList(value)
      param.onUpdate?.(value)

    // #endregion
    //
    // #region ListenControlChange
    
      control.addEventListener(
        controlData.changeEvent,
        function() {
          //
          // #region UpdateSettingValueAndClassList
          
            setSiteSetting(
              param.name,
              this.checked,
              param.defaultValue,
              view,
              { parseUrl: true }
            )
            updateClassList(this.checked)
            param.onUpdate?.(this.checked)

          // #endregion
          //
        }
      )
    
    // #endregion
    //
  }

  // #function updateAndListenSelectSetting
  /*
    SYNOPSIS

    DESCRIPTION

    TODO
    document

    PARAMETER param
    {
      PROPERTY name
      string
      The name of the site setting to initialize.
      A select element's ID is formed by adding
      "-select" to the name.

      PROPERTY defaultValue

      PROPERTY onUpdate?

      PROPERTY view?
      Default: window
    }

    NOTE

    EXAMPLE

    EXCEPTION

    OUTPUT
  */
  export function initSelectSetting(param) {
    //
    // #region ValidateInput
    
      validate(function() {
        return param.name && param.defaultValue
      })
    
    // #endregion
    //
    // #region Library
    
      const view = param.view || window
      const document = view.document.documentElement
      let currentClasses

      // #function updateDocumentElementClassList
      function updateClassList(select, selectData) {
        //
        // #region GetOptionElement
        
          let option
          if (selectData.isCustom) {
            //
            // #region GetCustomElement
            
              const value = select.value
              const options = select.querySelectorAll(
                selectData.prefix + "-option"
              )

              for (const option_ of options) {
                if (
                  option_.value == value ||
                  option_.getAttribute('value') == value
                ) {
                  option = option_
                  break
                }
              }

              assert(function() {
                return option != undefined
              })
            
            // #endregion
            //
          } else {
            //
            // #region GetStandardElement
            
              const selected = select.selectedOptions
              assert(function() {
                return selected.length == 1
              })
              option = selected[0]
            
            // #endregion
            //
          }
        
        // #endregion
        //
        // #region AddClasses

          currentClasses =
            option.dataset.classes?.split(/\s+/).filter(Boolean) ||
              [ param.name + "-" + option.value ]

          document.classList.add(...currentClasses)          
        
        // #endregion
        //
        // #region ReturnSelectedOption
        
          return option
        
        // #endregion
        //
      }
      
    // #endregion
    //
    // #region GetControlElement_AndResolveSettingValue
    
      const select = view.document.getElementById(
        param.name + "-select"
      )
      validate(function() {
        return !select.multiple
      })
      const selectData = computeCustomControlData(select)

      const value = getSiteSetting(param.name, view) ||
        param.defaultValue

    // #endregion
    //
    // #region UpdateControlAndClassList

      select.value = value
      const option = updateClassList(select, selectData)
      param.onUpdate?.(
        value, { origin: 'init', dataset: option.dataset }
      )

    // #endregion
    //
    // #region DefineUpdateFunction
    
      // #function updateSettingValue_AndStyleVariable
      const updateSettingAndStyle = function({ origin }) {
        //
        // #region UpdateSettingValueAndClassList

          assert(function() {
            for (var i = 0; i < currentClasses.length; i++) {
              if (!document.classList.contains(currentClasses[i])) {
                return false
              }
            }
            return true
          })
          
          setSiteSetting(
            param.name,
            select.value,
            param.defaultValue,
            view
          )

          document.classList.remove(...currentClasses)
          const option = updateClassList(select, selectData)
          param.onUpdate?.(
            select.value,
            { origin, dataset: option.dataset }
          )

        // #endregion
        //
      }

    // #endregion
    //
    // #region ListenControlChange
    
      select.addEventListener(
        selectData.changeEvent,
        function(_) {
          updateSettingAndStyle({ origin: 'event' })
        }
      )
    
    // #endregion
    //
    // #region ReturnUpdateClosures

      return {
        update: function(value, { origin } = {}) {
          select.value = value
          select.requestUpdate?.()
          updateSettingAndStyle({ origin })
        }
      }

    // #endregion
    //
  }

  // TODO(bp+rv): created from `initSelectSetting`
  // #function updateAndListenRangeSetting
  /*
    SYNOPSIS

    DESCRIPTION

    TODO
    document

    PARAMETER param
    {
      PROPERTY name
      string
      The name of the site setting to initialize.
      A range element's ID is formed by adding
      "-range" to the name.

      PROPERTY defaultValue

      PROPERTY continuous
      boolean?
      Default: false

      PROPERTY onUpdate?

      PROPERTY view?
      Default: window
    }

    NOTE

    EXAMPLE

    EXCEPTION

    OUTPUT
  */
  export function initRangeSetting(param) {
    //
    // #region ValidateInput
    
      validate(function() {
        return param.name && param.defaultValue
      })
    
    // #endregion
    //
    // #region Data
    
      const view = param.view || window
      const document = view.document.documentElement
      // #var controlElementId
      const elementId = param.name + "-range"
      // #var styleVariableName
      const variableName = "--" + param.name

    // #endregion
    //
    // #region GetControlElement_AndResolveSettingValue
    
      const range = view.document.getElementById(
        elementId
      )
      const rangeData = computeCustomControlData(range)

      const value = getSiteSetting(param.name, view) ||
        param.defaultValue

    // #endregion
    //
    // #region UpdateControlAndStyleVariable

      range.value = value
      document.style.setProperty(
        variableName, range.value
      )
      param.onUpdate?.(value, { origin: 'init' })

    // #endregion
    //
    // #region DefineUpdateFunction

      /* TODO(bp+n): region
         DefineUpdateContextFunction
         CreateUpdateFunction
         DefineFunction/Update
         DefineFunction/UpdateSettingAndStyle
       */
    
      // #function updateSettingValue_AndStyleVariable
      const updateSettingAndStyle = function({ origin }) {
        const that = this
        assert(function() {
          return that == range || that == undefined
        })

        setSiteSetting(
          param.name,
          range.value,
          param.defaultValue,
          view
        )

        document.style.setProperty(
          variableName, range.value
        )

        param.onUpdate?.(range.value, { origin })
      }
    
    // #endregion
    //
    // #region ListenControlChange
    
      const eventName = param.continuous ?
        rangeData.inputEvent :
        rangeData.changeEvent

      range.addEventListener(
        eventName,
        function(_) {
          updateSettingAndStyle({ origin: 'event' })
        }
      )
    
    // #endregion
    //
    // #region ReturnUpdateClosures

      return {
        update: function(value, { origin } = {}) {
          range.value = value
          // TODO(bp): confirm if needed
          range.requestUpdate?.()
          updateSettingAndStyle({ origin })
        },
        updateFromStyle: function(param) {
          const style = getComputedStyle(document)
          const value = Number(
            style.getPropertyValue(variableName).trim()
          )
          this.update(value, param)
        }
      }

    // #endregion
    //
  }

// #endregion
//
// #region Web/Other

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
  export function normalizeHtmlText(value) {
    return value
      .trimStart()
      .split("\n")
      .map(line => line.trimStart())
      .join("\n")
  }

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
  export function initTooltips(view = window) {
    //
    // #region Library
    
      let tooltip

      function showTooltip(event) {
        const element = event.currentTarget
        // TODO(bp+n): textSource
        const textElement = element.parentElement.querySelector(
          '.tooltip-text'
        )
        if (!textElement) {
          return
        }

        tooltip.textContent = textElement.textContent
        const { left, top } = computePosition(
          element, tooltip, view
        )
        
        tooltip.style.left = left + "px"
        tooltip.style.top = top + "px"
        tooltip.classList.add('visible')
      }

      function hideTooltip() {
        tooltip.classList.remove('visible')
      }

    // #endregion
    //
    // #region CreateTooltipElement
    
      tooltip = view.document.createElement('div')
      tooltip.className = 'tooltip'
      tooltip.id = 'tooltip'
      view.document.body.appendChild(tooltip)
    
    // #endregion
    //
    // #region AddListeners

      view.document.querySelectorAll('.with-tooltip').forEach(
        element => {
          element.addEventListener('mouseenter', showTooltip)
          element.addEventListener('mouseleave', hideTooltip)
          element.addEventListener('focus', showTooltip)
          element.addEventListener('blur', hideTooltip)
        }
      )
    
    // #endregion
    //
  }

// #endregion
//
// #region

    // Web/Utils

  function computePosition(reference, element, view = window) {
    const rect = reference.getBoundingClientRect()
    const elementHeight = element.offsetHeight
    const viewportHeight = view.innerHeight
    
    const elementCenter = rect.top + rect.height / 2
    const isInLowerHalf = elementCenter > viewportHeight / 2
    
    const left = rect.left + view.scrollX
    const top = isInLowerHalf
      ? rect.top + view.scrollY - elementHeight
      : rect.bottom + view.scrollY
    
    return { left, top }
  }

  export function computeCustomControlData(value) {
    const tag = value.tagName.toLowerCase()
    const match = tag.match(/^(?!wa-)(\w+)-/)
    const matches = Boolean(match)
    const prefix = matches ? match[1] : undefined
  
    return {
      isCustom: matches,
      prefix: prefix,
      inputEvent: matches ?
        prefix + "-input" :
        "input",
      changeEvent: matches ?
        prefix + "-change" :
        "change"
    }
  }

    // Web/Unused

  /**
   * @param {string | URLSearchParams} value 
   * @returns {object}
   */
  export function convertURLQueryToPlainObject(value) {
    value = typeof value == 'string' ? 
      new URLSearchParams(value) :
      value

    return Object.fromEntries(value.entries())
  }

// #endregion
//