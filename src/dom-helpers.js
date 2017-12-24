/**
 * Check whether some DOM node is our Component's node.
 */
function hasClass(node, ignoreClass) {
  // SVG <use/> elements do not technically reside in the rendered DOM, so
  // they do not have classList directly, but they offer a link to their
  // corresponding element, which can have classList. This extra check is for
  // that case.
  // See: http://www.w3.org/TR/SVG11/struct.html#InterfaceSVGUseElement
  // Discussion: https://github.com/Pomax/react-onclickoutside/pull/17
  return (node.correspondingElement || node).classList.contains(ignoreClass);
}

/**
 * Try to find our node in a hierarchy of nodes, returning the document
 * node as highest node if our node is not found in the path up.
 */
export function clickedOutsideNodeAndIgnoredSubtree(componentNode, event, ignoreClass) {
  let current = event.target;

  if (current === componentNode) {
    return false;
  }

  // If source=local then this event came from 'somewhere'
  // inside and should be ignored. We could handle this with
  // a layered approach, too, but that requires going back to
  // thinking in terms of Dom node nesting, running counter
  // to React's 'you shouldn't care about the DOM' philosophy.
  while (current.parentNode) {
    if (current === componentNode || hasClass(current, ignoreClass)) {
      return false;
    }
    current = current.parentNode;
  }
  return true;
}

/**
 * Check if the browser scrollbar was clicked
 */
export function clickedBrowserScrollbar(evt) {
  return document.documentElement.clientWidth <= evt.clientX || document.documentElement.clientHeight <= evt.clientY;
}
