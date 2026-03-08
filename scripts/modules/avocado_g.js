// #library avocado-g-for-gleam
//
// #region Web

  // GCA
  /**
   * Persist selected query parameters from the current page URL to all navigated <a> links.
   * This includes left-click, middle-click, "Open in new tab", and keyboard Enter.
   *
   * @param {string[]} name - Array of parameter keys to persist.
   *
   * Usage:
   * import { persistQueryParams } from './persistQueryParams.js';
   * persistQueryParams(["foo", "bar"]);
   */
  export function persistQueryParams(name) {
    if (!Array.isArray(name) || name.length === 0) {
      throw new Error(
        "persistQueryParams: 'name' must be a non-empty array of parameter keys"
      );
    }

    /**
     * Main event handler. Patches the link’s href just before navigation.
     */
    function handler(e) {
      const a = e.target.closest?.('a[href]');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href) return;

      // Skip non-navigational links:
      //  - "#" is an anchor jump (e.g. href="#section")
      //  - "mailto:" opens email client
      //  - "tel:" opens phone dialer
      if (/^(#|mailto:|tel:)/.test(href)) return;

      const hrefUrl = new URL(href, document.baseURI);
      const baseUrl = new URL(document.baseURI);

      if (hrefUrl.origin !== baseUrl.origin) return;

      // Preserve and restore the link’s initial query params before merging
      if (a.dataset.originalQuery) {
        hrefUrl.search = a.dataset.originalQuery;
      } else {
        a.dataset.originalQuery = hrefUrl.search;
      }

      // Merge selected query params that aren’t already present in href
      const hrefQuery = hrefUrl.searchParams;
      const baseQuery = baseUrl.searchParams;
      name.forEach(key => {
        if (!hrefQuery.has(key) && baseQuery.has(key)) {
          hrefQuery.set(key, baseQuery.get(key));
        }
      });

      // Update the link’s href with merged query params
      // We do not prevent default; the browser will use the new href
      a.setAttribute('href', hrefUrl.href);
    }

    // Capture phase ensures we run before native link handling
    document.addEventListener('click', handler, true);
    document.addEventListener('auxclick', handler, true); // middle-click
    document.addEventListener('contextmenu', handler, true); // right-click "Open in new tab"

    // Handle keyboard Enter on focused <a> links
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && document.activeElement?.matches('a[href]')) {
        handler({ target: document.activeElement, type: 'keydown' });
      }
    }, true);
  }

  // GC
  /**
   * Checks if a given DOM element is effectively empty.
   * An element is considered empty if it contains no element nodes
   * and no text nodes with content other than whitespace.
   * Comments are ignored.
   *
   * @param {Element} element The DOM element to check.
   * @returns {boolean} True if the element is effectively empty, false otherwise.
   * @throws {Error} If the provided input is not a valid DOM Element.
   */
  export function elementIsEmpty(element) {
    // --- Input Validation ---
    // Ensure the input is a valid DOM element node.
    // element.nodeType === 1 checks if it's an Element.
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      // Throw an error for invalid input, as the check cannot be performed reliably.
      // Alternatively, you could return null or a specific value indicating invalid input,
      // but throwing an error is often clearer for precondition failures.
      throw new Error("Invalid input: The provided value must be a DOM Element.");
    }

    // --- Check 1: Element Children ---
    // Check if the element has any direct children that are elements themselves.
    // The 'children' property specifically lists only element nodes.
    if (element.children.length > 0) {
      return false; // Has element children, therefore not empty.
    }

    // --- Check 2: Non-Whitespace Text Content ---
    // Check if the element contains any text content (including text in descendants)
    // after trimming leading/trailing whitespace.
    // The 'textContent' property gets the text content of the element and all its
    // descendants, ignoring comments and element tags.
    if (element.textContent.trim() !== '') {
      return false; // Has text content that isn't just whitespace, therefore not empty.
    }

    // --- Conclusion ---
    // If the element has no element children AND no non-whitespace text content,
    // it is considered effectively empty.
    return true;
  }

  // GC
  /* NOTE ConvertHtmlListToText_Prompt

    Write JavaScript function 'convertHtmlListToHtmlText' to convert an HTML list element with all item elements to an HTML plain text list.

    —Parameters:
    • listElement
    • param — an object with the parameters/properties

    —Parameter 'param' has these parameters/properties:
    • format: multiline or one-line (default: one-line)
    • multilinePrefix (default: "—")
    • delimiter (for one-line) (default: ", ")
    • Option to remove all HTML markup
    • Option to wrap output in paragraph (default: true) (unclear usefulness, provide assessment on it)
    • If you see other options that you might strongly recommend, suggest them before generating the function.

    —Note:
    • If there is something important to consider and understand, say it before writing.
    • Ensure 'multiline' is really multiline. That is, browser should render it as multiline.

    —Code style:
    • Use 2 spaces for indentation
    • Maximum width of a line from the start of non-space characters: 50 for comments and 65 otherwise
    • No semicolons at the end of lines
    • Use curly braces for conditional and loop structures with a single statement
    • Logically divide the function body into section using #region/#endregion comment syntax
    • Comment key steps explaining the purpose and reason in great detail
   */
  export function convertHtmlListToHtmlText(listElement, param) {
    // #region Initialization and parameter defaults
    // Set default options if not provided
    param = param || {}
    var format = param.format || 'one-line'
    var multilinePrefix = param.multilinePrefix || '—'
    var delimiter = param.delimiter || ', '
    var removeHtmlMarkup = param.removeHtmlMarkup || false
    var wrapOutput = (param.wrapOutput === undefined) ? true : param.wrapOutput
    // Option to trim whitespace from each item (suggested option)
    var trimItems = (param.trimItems === undefined) ? true : param.trimItems
    // #endregion

    // #region Extract list item text
    // Get all <li> children from the list element
    var items = listElement.getElementsByTagName('li')
    var results = []
    for (var i = 0; i < items.length; i++) {
      var itemContent = items[i].innerHTML
      // Optionally remove HTML markup using a temporary element
      if (removeHtmlMarkup) {
        var tempDiv = document.createElement('div')
        tempDiv.innerHTML = itemContent
        itemContent = tempDiv.textContent || tempDiv.innerText || ''
      }
      // Optionally trim whitespace from the text content
      if (trimItems) {
        itemContent = itemContent.trim()
      }
      results.push(itemContent)
    }
    // #endregion

    // #region Build output based on the format option
    var output = ''
    if (format === 'multiline') {
      // Join with newline and prefix each line with the designated prefix
      output = results.map(function (item) {
        return multilinePrefix + ' ' + item
      }).join('<br>')
    }
    else {
      // Default one-line format; join items using the delimiter
      output = results.join(delimiter)
    }
    // #endregion

    // #region Wrap output if required and return
    // Wrap the output in a paragraph element if wrapOutput is true
    if (wrapOutput) {
      output = '<p>' + output + '</p>'
    }
    return output
    // #endregion
  }

// #endregion
//