/**
 * Check if classList contains any of the given classes,
 * transparently handling singular and array cases.
 */
function containsAny(classList, classes) {
  if (Array.isArray(classes)) {
    for (const className of classes) {
      if (classList.contains(className)) {
        return true;
      }
    }
    return false;
  } else {
    return classList.contains(classes);
  }
}

/**
 * Check whether some DOM node is our Component's node.
 */
function isNodeFound(current, componentNode, ignoreClass) {
  if (current === componentNode) {
    return true;
  }
  // SVG <use/> elements do not technically reside in the rendered DOM, so
  // they do not have classList directly, but they offer a link to their
  // corresponding element, which can have classList. This extra check is for
  // that case.
  // See: http://www.w3.org/TR/SVG11/struct.html#InterfaceSVGUseElement
  // Discussion: https://github.com/Pomax/react-onclickoutside/pull/17
  if (current.correspondingElement) {
    return containsAny(current.correspondingElement.classList, ignoreClass);
  }
  return containsAny(current.classList, ignoreClass);
}

/**
 * Try to find our node in a hierarchy of nodes, returning the document
 * node as highest node if our node is not found in the path up.
 */
function findHighest(current, componentNode, ignoreClass) {
  if (current === componentNode) {
    return true;
  }

  // If source=local then this event came from 'somewhere'
  // inside and should be ignored. We could handle this with
  // a layered approach, too, but that requires going back to
  // thinking in terms of Dom node nesting, running counter
  // to React's 'you shouldn't care about the DOM' philosophy.
  while (current.parentNode) {
    if (isNodeFound(current, componentNode, ignoreClass)) {
      return true;
    }
    current = current.parentNode;
  }
  return current;
}

/**
 * Check if the browser scrollbar was clicked
 */
function clickedScrollbar(evt) {
  return document.documentElement.clientWidth <= evt.clientX || document.documentElement.clientHeight <= evt.clientY;
}

/**
 * Generate the event handler that checks whether a clicked DOM node
 * is inside of, or lives outside of, our Component's node tree.
 */
export default function generateOutsideCheck(
  componentNode,
  eventHandler,
  ignoreClass,
  excludeScrollbar,
  preventDefault,
  stopPropagation,
) {
  return function(evt) {
    if (preventDefault) {
      evt.preventDefault();
    }
    if (stopPropagation) {
      evt.stopPropagation();
    }
    const current = evt.target;
    if ((excludeScrollbar && clickedScrollbar(evt)) || findHighest(current, componentNode, ignoreClass) !== document) {
      return;
    }
    eventHandler(evt);
  };
}
