import * as avocado from "./modules/avocado.js"
import * as avocado_blog from "./modules/avocado_blog.js"
import Adapter from "./modules/adapter.js"
import * as custom from "./custom.js"
import { setDefaultAnimation } from "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/utilities/animation-registry.js"

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
export async function initData(view) {
  //
  // #region Region
  
    const elements = {
      document: view.document,
      postCounter: document.getElementById('post-counter'),
      timeline: document.getElementById('timeline'),
      scrollSentinel: document.getElementById("scroll-sentinel")
    }
    const state = {
      filter: undefined,
      // TODO(bp+c): `undefined` instead
      currentPage: 0,
      isLoadingPosts: false
    }
    const adapter = new Adapter()
    await adapter.init()
  
    return { view, elements, state, adapter }
  
  // #endregion
  //
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
export async function init({ view }) {
  //
  // #region InitTooltips

    avocado.initTooltips(view)

  // #endregion
  //
  // #region InitFolding

    const sections = view.document.querySelectorAll(
      "body .body-section"
    )
    for (const section of sections) {
      avocado_blog.initFolding(section)
    }

  // #endregion
  //
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
export async function initAfterScript({ elements, state, adapter }) {
  //
  // #region UpdatePostTimeline_OnScroll
  
    const loadNextPage_OnIntersection =
      async entries => {
        //
        // #region Data

          avocado.assert(function() {
            return entries.length == 1
          })
          const [ entry ] = entries
        
        // #endregion
        //
        // #region

          let logData
          if (avocado.config.debug.log) {
            logData = {
              meta: import.meta,
              localPath: "init/UpdatePostTimeline_OnScroll",
              fn: loadNextPage_OnIntersection,
              parameters: { entries },
              region: "AfterData",
              context: {
                entries,
                entry,
                isIntersecting: entry.isIntersecting,
                isVisible: entry.isVisible
              },
              level: 1
            }
            avocado.log(logData)
          }
          
        // #endregion
        //
        // #region LoadNextPage_IfIntersecting

          // TODO(bp+n): region LoadNextPage_IfIntersecting,
          // LoadNextPage, LoadNextPage_OnIntersection

          if (entry.isIntersecting) {
            await loadNextPostTimelinePage({
              elements, state, adapter
            })
          }
        
        // #endregion
        //
        // #region

          if (avocado.config.debug.log) {
            logData.region = "AfterLoad"
            logData.context = {
              isIntersecting: entry.isIntersecting,
              isVisible: entry.isVisible
            }
            avocado.log(logData)
          }
        
        // #endregion
        //
      }

    const observer = new IntersectionObserver(
      loadNextPage_OnIntersection,
      {
        root: null,
        rootMargin: "0%",
        threshold: 0
      }
    )

    observer.observe(elements.scrollSentinel)
    
  // #endregion
  //
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
export async function initTopSection(view = window) {
  //
  // #region GetParameters

    const document = view.document

  // #endregion
  //
  // #region SettingsSection

    /* TODO(bp+n)
       region ChangeTheme_IfHasMapping
       IfCurrentThemeHasMapping_ChangeThemeToMappedValue
       IfHasMapping_ChangeCurrentThemeToMappedValue
       IfHasMapping_ChangeThemeToMappedValue
       IfHasMapping_ChangeToMappedTheme
       IfHasMapping_SetThemeToMapped
       IfThemeHasMapping_ChangeTheme
       IfHasMapping_ChangeTheme
     */

    const settingsButton = document.getElementById('settings-button')
    if (settingsButton) {
      //
      // #region InitSettingsButton

        // TODO(bp+c+au): OTU variables

        const topSection = document.getElementById('top-section')
        const settingsSection = document.getElementById('settings-section')
        const chevron = topSection.querySelector(".details-chevron")
        
        settingsButton.addEventListener('click', function () {
          settingsSection.hidden = !settingsSection.hidden
          chevron.classList.toggle('open')
        })

      // #endregion
      //
      // #region InitSetting/DarkMode

        avocado.initBooleanSetting({
          name: 'dark-mode',
          defaultValue: false,
          onUpdate: function(value) {
            //
            // #region ToggleShoelaceDarkTheme
            
              document.documentElement.classList.toggle(
                'sl-theme-dark', value
              )
            
            // #endregion
            //
          },
          view: view
        })

      // #endregion
      //
      // #region InitSetting/HigherContrast
      
        avocado.initBooleanSetting({
          name: 'higher-contrast',
          defaultValue: false,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/ClassicStyle

        avocado.initBooleanSetting({
          name: 'classic-style',
          defaultValue: false,
          view: view
        })

      // #endregion
      //
      // #region InitSetting/Theme

        const defaultPrimaryHue = 90
        const defaultSecondaryHue = 250
        const defaultSurfaceVariantHue = 30

        const defaultThemePrimaryScheme = 'saturated'
        const defaultThemeSecondaryScheme = 'standard'
        const defaultThemeSurfaceVariantScheme = 'standard'
        const defaultThemeSurfaceVariantSaturation = 'medium'
        const defaultThemeAccent = 'hovered-links-primary'
        const defaultFontsStyles = 'standard'

        const themeSetting = avocado.initSelectSetting({
          name: 'theme',
          defaultValue: 'standard',
          onUpdate: function(value, param) {
            if (param.origin == 'init' || value == 'custom') {
              return
            }
            
            const _param = { origin: 'theme' }

            themeSurfaceVariantHueSourceSetting.update(
              param.dataset.themeSurfaceVariantHueSource || 'default',
              _param
            )

            const style = document.documentElement.style
            style.removeProperty('--primary-h')
            style.removeProperty('--secondary-h')
            style.removeProperty('--surface-variant-h')

            themePrimarySchemeSetting.update(
              // TODO(bp+c): select using default on undefined
              param.dataset.themePrimaryScheme ||
                defaultThemePrimaryScheme,
              _param
            )
            themeSecondarySchemeSetting.update(
              param.dataset.themeSecondaryScheme ||
                defaultThemeSecondaryScheme,
              _param
            )
            themeSurfaceVariantSchemeSetting.update(
              param.dataset.themeSurfaceVariantScheme ||
                defaultThemeSurfaceVariantScheme,
              _param
            )
            themeSurfaceVariantSaturationSetting.update(
              param.dataset.themeSurfaceVariantSaturation ||
                defaultThemeSurfaceVariantSaturation,
              _param
            )
            themeAccentSetting.update(
              param.dataset.themeAccent || defaultThemeAccent,
              _param
            )
            fontsStylesSetting.update(
              param.dataset.fontsStyles || defaultFontsStyles,
              _param
            )

            primaryHueSetting.updateFromStyle(_param)
            secondaryHueSetting.updateFromStyle(_param)
            surfaceVariantHueSetting.updateFromStyle(_param)
          },
          view: view
        })

      // #endregion
      //
      // #region InitSetting/VisualDensity

        avocado.initSelectSetting({
          name: 'visual-density',
          defaultValue: 'compact',
          view: view
        })

      // #endregion
      //
      // #region InitSetting/DevMode
      
        avocado.initBooleanSetting({
          name: 'dev-mode',
          defaultValue: false,
          view: view
        })

      // #endregion
      //
      // #region InitSetting/ThemeHues

        const onThemeHuesUpdate = function(_, param) {
          // TODO(bp+f)
          if (param.origin != 'init' &&
              param.origin != 'theme') {
            themeSetting.update('custom')
          }
        }

        const setPerceivedHueBrightnessFactor = function(name, value, k = 0.8, level = "") {
          const _k = value <= 60 ?
            1 + (k - 1) * (value / 60) :
            value <= 230 ?
              k + (1 - k) * ((value - 60) / (230 - 60)) :
              1

          level = level ? `-${level}` : ""
          document.documentElement.style.setProperty(
            `--${name}-l-k${level}`, _k.toFixed(2)
          )
        }
        
        const updateSurfaceVariantHueIfSourced = function(name, value, param) {
          if (param.origin == 'init') {
            return
          }
          if (themeSurfaceVariantHueSourceSettingValue == name) {
            surfaceVariantHueSetting.update(value)
          }
        }
      
        const primaryHueSetting = avocado.initRangeSetting({
          name: 'primary-h',
          defaultValue: defaultPrimaryHue,
          continuous: true,
          onUpdate: function(value, param) {
            onThemeHuesUpdate(value, param)
            updateSurfaceVariantHueIfSourced('primary', value, param)
          },
          view: view
        })

        const secondaryHueSetting = avocado.initRangeSetting({
          name: 'secondary-h',
          defaultValue: defaultSecondaryHue,
          continuous: true,
          onUpdate: function(value, param) {
            onThemeHuesUpdate(value, param)
            setPerceivedHueBrightnessFactor("secondary", value)
            setPerceivedHueBrightnessFactor("secondary", value, 0.55, "low")
            updateSurfaceVariantHueIfSourced('secondary', value, param)
          },
          view: view
        })

        const surfaceVariantHueSetting = avocado.initRangeSetting({
          name: 'surface-variant-h',
          defaultValue: defaultSurfaceVariantHue,
          continuous: true,
          onUpdate: function(value, param) {
            onThemeHuesUpdate(value, param)
            setPerceivedHueBrightnessFactor("surface-variant", value)
            if (param.origin == 'event') {
              themeSurfaceVariantHueSourceSetting.update('custom')
            }
          },
          view: view
        })

      // #endregion
      //
      // #region InitSetting/ThemeSchemes

        const themeSchemeSettingOnUpdate = function(_, param) {
          // TODO(bp+f)
          if (param.origin != 'init' &&
              param.origin != 'theme') {
            themeSetting.update('custom')
          }
        }
        const themePrimarySchemeSetting = avocado.initSelectSetting({
          name: 'theme-primary-scheme',
          defaultValue: defaultThemePrimaryScheme,
          onUpdate: themeSchemeSettingOnUpdate,
          view: view
        })
        const themeSecondarySchemeSetting = avocado.initSelectSetting({
          name: 'theme-secondary-scheme',
          defaultValue: defaultThemeSecondaryScheme,
          onUpdate: themeSchemeSettingOnUpdate,
          view: view
        })
        const themeSurfaceVariantSchemeSetting = avocado.initSelectSetting({
          name: 'theme-surface-variant-scheme',
          defaultValue: defaultThemeSurfaceVariantScheme,
          onUpdate: themeSchemeSettingOnUpdate,
          view: view
        })
        let themeSurfaceVariantHueSourceSettingValue
        const themeSurfaceVariantHueSourceSetting = avocado.initSelectSetting({
          name: 'theme-surface-variant-hue-source',
          defaultValue: 'default',
          onUpdate: function(value, param) {
            themeSurfaceVariantHueSourceSettingValue = value
            themeSchemeSettingOnUpdate(value, param)
            // TODO(bp+f)
            if (param.origin != 'init' &&
                param.origin != 'theme' &&
                value != 'custom') {
              const style = document.documentElement.style
              style.removeProperty('--surface-variant-h')
              surfaceVariantHueSetting.updateFromStyle({
                origin: 'theme-surface-variant-hue-source'
              })
            }
          },
          view: view
        })
        const themeSurfaceVariantSaturationSetting = avocado.initSelectSetting({
          name: 'theme-surface-variant-saturation',
          defaultValue: defaultThemeSurfaceVariantSaturation,
          onUpdate: themeSchemeSettingOnUpdate,
          view: view
        })

        // TODO(c+mag)
        const themeAccentSetting = avocado.initSelectSetting({
          name: 'theme-accent',
          defaultValue: defaultThemeAccent,
          onUpdate: themeSchemeSettingOnUpdate,
          view: view
        })

      // #endregion
      //
      // #region InitSetting/AdaptContrastOnSecondary
      
        avocado.initBooleanSetting({
          name: 'adapt-contrast-on-secondary',
          defaultValue: false,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/IncreasedSurfaceLevelsDistance
      
        avocado.initBooleanSetting({
          name: 'increased-surface-levels-distance',
          defaultValue: false,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/UIFont

        avocado.initSelectSetting({
          name: 'font-ui',
          defaultValue: 'open-sans',
          view: view
        })
        
      // #endregion
      //
      // #region InitSetting/PostFont

        avocado.initSelectSetting({
          name: 'font-post',
          defaultValue: 'tinos',
          view: view
        })
        
      // #endregion
      //
      // #region InitSetting/FontsStyles

        const fontsStylesSetting = avocado.initSelectSetting({
          name: 'fonts-styles',
          defaultValue: defaultFontsStyles,
          onUpdate: themeSchemeSettingOnUpdate,
          view: view
        })
        
      // #endregion
      //
      // #region InitSetting/Texture
      
        avocado.initSelectSetting({
          name: 'top-section-texture',
          defaultValue: 'none',
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/OutlineMode

        avocado.initBooleanSetting({
          name: 'outline-mode',
          defaultValue: false,
          view: view
        })

      // #endregion
      //
      // #region InitSetting/FullScreenWidth
      
        avocado.initBooleanSetting({
          name: 'full-screen-width',
          defaultValue: false,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/Stacked
      
        avocado.initBooleanSetting({
          name: 'stacked',
          defaultValue: false,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/SectionDivider

        avocado.initSelectSetting({
          name: 'section-divider',
          defaultValue: 'split',
          view: view
        })

      // #endregion
      //
      // #region InitSetting/BorderWidth

        avocado.initSelectSetting({
          name: 'border-width',
          defaultValue: 'thin',
          view: view
        })

      // #endregion
      //
      // #region InitSetting/ColoredBorders
      
        avocado.initBooleanSetting({
          name: 'colored-borders',
          defaultValue: false,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/Search
      
        avocado.initBooleanSetting({
          name: 'search',
          defaultValue: true,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/Filter
      
        avocado.initBooleanSetting({
          name: 'filter',
          defaultValue: true,
          view: view
        })
      
      // #endregion
      //
      // #region InitSetting/PostActionsAlignment

        avocado.initSelectSetting({
          name: 'post-actions-alignment',
          defaultValue: 'space-evenly',
          view: view
        })

      // #endregion
      //
      // #region PatchSettings/ForwardClicks
      
        // GCA
        const forwardClicks = (cb) => {
          cb.addEventListener('click', (e) => {
            if (cb.disabled) return;
            const base = cb.shadowRoot?.querySelector('[part="base"]');
            if (!base) return;
            const path = e.composedPath();
            if (path.includes(base) || path.some(n => n instanceof HTMLInputElement)) return;
            base.click();
          });
        }
        document.querySelectorAll('sl-checkbox').forEach(forwardClicks);
        document.querySelectorAll('sl-switch').forEach(forwardClicks);

      // #endregion
      //
    }

  // #endregion
  //
  // #region SetAnimation
  
    // TODO(bp+c): move to `init`
    setDefaultAnimation('details.show', null)
    setDefaultAnimation('details.hide', null)
  
  // #endregion
  //
}

export async function _loadNextPostTimelinePage({
  elements, state, adapter
}) {
  // TODO(bp+n): section Data, InitPageIndex,
  // EnsurePageIndexInitialized
  // TODO(bp+n): section UpdateTimeline,
  // TryUpdateTimeline

    // #section Data

  state.currentPage ??= 0

    // #section UpdateTimeline
    
  const timelineFragment_ = await avocado_blog.buildPosts({
    document: elements.document,
    adapter,
    query: state.filter,
    page: state.currentPage + 1,
    pagePostCount: custom.config?.pagePostCount
  })
  if (avocado.config.debug.log) {
    avocado.log({
      meta: import.meta,
      fn: _loadNextPostTimelinePage,
      // TODO(bp+uc)
      parameters: { query: state.filter },
      region: "UpdateTimeline/AfterBuildPosts",
      // TODO(bp+uc)
      context: { query: state.filter, timelineFragment_ },
      level: 1
    })  
  }
  if (!timelineFragment_) {
    return
  }
  elements.timeline.append(timelineFragment_)

    // #section IncrementPageIndex

  state.currentPage++

    // #section UpdatePostCounter

  const count = elements.timeline.childElementCount
  const totalCount = await adapter.getPostCount({
    filter: state.filter
  })
  elements.postCounter.textContent =
    `${count} of ${totalCount}`
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
export async function loadNextPostTimelinePage({
  elements, state, adapter
}) {
  if (state.isLoadingPosts) {
    return
  }
  state.isLoadingPosts = true
  try {
    await _loadNextPostTimelinePage({
      elements, state, adapter
    })
  } finally {
    state.isLoadingPosts = false
  }
}