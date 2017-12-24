import { createElement, Component } from 'react';
import { findDOMNode } from 'react-dom';
import { testPassiveEventSupport } from './detect-passive-events';
import uid from './uid';

let passiveEventSupport;

const DOMHandlersMap = {};
const instanceHandlersMap = {};
const enabledInstances = {};

const touchEvents = ['touchstart', 'touchmove'];

const NO_HANDLER = 'WrappedComponent lacks a function for processing outside click events specified by the handleClickOutside config option.';

export { clickedBrowserScrollbar, clickedOutsideNodeAndIgnoredSubtree } from './dom-helpers';

export const defaultClickedOutsideComparator = (node, event) => !node.contains(event.target);

/**
 * This function generates the HOC function that you'll use
 * in order to impart onOutsideClick listening to an
 * arbitrary component. It gets called at the end of the
 * bootstrapping code to yield an instance of the
 * onClickOutsideHOC function defined inside setupHOC().
 */
export default function onClickOutsideHOC(WrappedComponent, config) {
  return class onClickOutside extends Component {
    static displayName = `OnClickOutside(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    static defaultProps = {
      eventTypes: ['mousedown', 'touchstart'],
      preventDefault: false,
      stopPropagation: false,
      clickedOutsideComparator: defaultClickedOutsideComparator,
    };

    static getClass = () => (WrappedComponent.getClass ? WrappedComponent.getClass() : WrappedComponent);

    constructor(props) {
      super(props);
      this._uid = uid();
    }

    /**
     * Access the WrappedComponent's instance.
     */
    getInstance() {
      if (!WrappedComponent.prototype.isReactComponent) {
        return this;
      }
      const ref = this.instanceRef;
      return ref.getInstance ? ref.getInstance() : ref;
    }

    /**
     * Add click listeners to the current document,
     * linked to this component's state.
     */
    componentDidMount() {
      // If we are in an environment without a DOM such
      // as shallow rendering or snapshots then we exit
      // early to prevent any unhandled errors being thrown.
      if (typeof document === 'undefined' || !document.createElement) {
        return;
      }

      const instance = this.getInstance();

      if (!config || typeof config.handleClickOutside !== 'function') {
        throw new Error(NO_HANDLER);
      }

      instanceHandlersMap[this._uid] = config.handleClickOutside(instance);

      if (typeof instanceHandlersMap[this._uid] !== 'function') {
        throw new Error(NO_HANDLER);
      }

      this.componentNode = findDOMNode(instance);
      this.enableOnClickOutside();
    }

    componentDidUpdate() {
      this.componentNode = findDOMNode(this.getInstance());
    }

    /**
     * Remove all document's event listeners for this component
     */
    componentWillUnmount() {
      this.disableOnClickOutside();
    }

    /**
     * Can be called to explicitly enable event listening
     * for clicks and touches outside of this element.
     */
    enableOnClickOutside = () => {
      if (typeof document === 'undefined' || enabledInstances[this._uid]) {
        return;
      }

      if (typeof passiveEventSupport === 'undefined') {
        passiveEventSupport = testPassiveEventSupport();
      }

      enabledInstances[this._uid] = true;

      let events = this.props.eventTypes;
      if (!events.forEach) {
        events = [events];
      }

      DOMHandlersMap[this._uid] = event => {
        if (this.props.disableOnClickOutside) return;
        if (this.componentNode === null) return;

        if (this.props.preventDefault) {
          event.preventDefault();
        }

        if (this.props.stopPropagation) {
          event.stopPropagation();
        }

        if (this.props.clickedOutsideComparator(this.componentNode, event)) {
          instanceHandlersMap[this._uid](event);
        }
      };

      events.forEach(eventName => {
        let handlerOptions = null;
        const isTouchEvent = touchEvents.indexOf(eventName) !== -1;

        if (isTouchEvent && passiveEventSupport) {
          handlerOptions = { passive: !this.props.preventDefault };
        }

        document.addEventListener(eventName, DOMHandlersMap[this._uid], handlerOptions);
      });
    };

    /**
     * Can be called to explicitly disable event listening
     * for clicks and touches outside of this element.
     */
    disableOnClickOutside = () => {
      delete enabledInstances[this._uid];
      const fn = DOMHandlersMap[this._uid];

      if (fn && typeof document !== 'undefined') {
        let events = this.props.eventTypes;
        if (!events.forEach) {
          events = [events];
        }
        events.forEach(eventName => document.removeEventListener(eventName, fn));
        delete DOMHandlersMap[this._uid];
      }
    };

    getRef = ref => (this.instanceRef = ref);

    /**
     * Pass-through render
     */
    render() {
      // eslint-disable-next-line no-unused-vars
      let { excludeScrollbar, ...props } = this.props;

      if (WrappedComponent.prototype.isReactComponent) {
        props.ref = this.getRef;
      } else {
        props.wrappedRef = this.getRef;
      }

      props.disableOnClickOutside = this.disableOnClickOutside;
      props.enableOnClickOutside = this.enableOnClickOutside;

      return createElement(WrappedComponent, props);
    }
  };
}
