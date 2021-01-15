import { useRef, useEffect, useCallback, createElement } from 'react';
import * as DOMHelpers from './dom-helpers';
import { testPassiveEventSupport } from './detect-passive-events';
import uid from './uid';

let passiveEventSupport;

const handlersMap = {};
const enabledInstances = {};

const touchEvents = ['touchstart', 'touchmove'];
export const IGNORE_CLASS_NAME = 'ignore-react-onclickoutside';

/**
 * Options for addEventHandler and removeEventHandler
 */
function getEventHandlerOptions(preventDefault, eventName) {
  let handlerOptions = null;
  const isTouchEvent = touchEvents.indexOf(eventName) !== -1;

  if (isTouchEvent && passiveEventSupport) {
    handlerOptions = { passive: !preventDefault };
  }
  return handlerOptions;
}

// This'll be the hook that underlies the component
export const useOnClickOutside = ({
  onClickOutside, // required
  eventTypes = ['mousedown', 'touchstart'],
  excludeScrollbar = false,
  outsideClickIgnoreClass = IGNORE_CLASS_NAME,
  preventDefault = false,
  stopPropagation = false,
  disableOnClickOutside = false,
}) => {
  console.log('calling hook');
  const domRef = useRef(null);
  const uidRef = useRef(uid());
  const enableOnClickOutside = useCallback(
    () => {
      console.log('got here at least');
      if (enabledInstances[uidRef.current]) {
        return;
      }

      if (typeof passiveEventSupport === 'undefined') {
        passiveEventSupport = testPassiveEventSupport();
      }

      enabledInstances[uidRef.current] = true;

      const events = eventTypes.forEach ? eventTypes : [eventTypes];

      handlersMap[uidRef.current] = event => {
        if (domRef.current === null) return;

        if (preventDefault) {
          event.preventDefault();
        }

        if (stopPropagation) {
          event.stopPropagation();
        }

        if (excludeScrollbar && DOMHelpers.clickedScrollbar(event)) return;

        const current = event.target;

        if (DOMHelpers.findHighest(current, domRef.current, outsideClickIgnoreClass) !== document) {
          return;
        }

        onClickOutside(event);
      };

      events.forEach(eventName => {
        document.addEventListener(eventName, handlersMap[uidRef.current], getEventHandlerOptions(preventDefault, eventName));
      });
    },
    [eventTypes, excludeScrollbar, onClickOutside, outsideClickIgnoreClass, preventDefault, stopPropagation],
  );
  const disableOnClickOutsideFn = useCallback(
    () => {
      delete enabledInstances[uidRef.current];
      const fn = handlersMap[uidRef.current];

      if (fn && typeof document !== 'undefined') {
        const events = eventTypes.forEach ? eventTypes : [eventTypes];
        events.forEach(eventName =>
          document.removeEventListener(eventName, fn, getEventHandlerOptions(preventDefault, eventName)),
        );
        delete handlersMap[uidRef.current];
      }
    },
    // Is this going to be a potential memory leak?
    [eventTypes, preventDefault],
  );
  useEffect(
    () => {
      console.log('using effect');
      enableOnClickOutside();
      return () => disableOnClickOutside();
    },
    [disableOnClickOutside, enableOnClickOutside],
  );
  return { enableOnClickOutside, disableOnClickOutside: disableOnClickOutsideFn };
};

export const OnClickOutside = ({ children, ...props }) => {
  const onClickOutsideProps = useOnClickOutside(props);
  return children(onClickOutsideProps);
};

export const withOnClickOutside = onClickOutsideConfig => Component => props => {
  const onClickOutsideProps = useOnClickOutside(onClickOutsideConfig);
  return createElement(Component, {...onClickOutsideProps, ...props});
};
