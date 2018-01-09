/**
 * Check whether some DOM node is our Component's node.
 */
export function isNodeFound(current, componentNode, ignoreClass) {
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
    return current.correspondingElement.classList.contains(ignoreClass);
  }
  return current.classList.contains(ignoreClass);
}

/**
 * Try to find our node in a hierarchy of nodes, returning the document
 * node as highest node if our node is not found in the path up.
 */
export function findHighest(current, componentNode, ignoreClass) {
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

const calcScrollbarWidth = container => {
  return container.offsetWidth - container.clientWidth;
};

const clickedOnContainerScrollbar = evt => {
  // Get the clicked container.
  const container = evt.target;

  const containerBounds = container.getBoundingClientRect();
  const clientX = evt.clientX;
  const clientY = evt.clientY;
  const scrollbarWidth = calcScrollbarWidth(container);

  // If the scrollbar width is zero, there is no scrollbar => return false
  return scrollbarWidth
    ? // Check if the click is in the X bounds of the scrollbar and y bounds of the container.
      clientX < containerBounds.right &&
        clientX > containerBounds.right - scrollbarWidth &&
        (clientY > containerBounds.top && clientY < containerBounds.bottom)
    : false;
};

/**
 * Check if a scrollbar was clicked.
 */
export function clickedScrollbar(evt) {
  // Check if it was the browser scrollbar or a container scrollbar.
  return (
    document.documentElement.clientWidth <= evt.clientX ||
    document.documentElement.clientHeight <= evt.clientY ||
    clickedOnContainerScrollbar(evt)
  );
}
