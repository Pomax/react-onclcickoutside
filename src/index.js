import { createElement, Component } from 'react';
import { findDOMNode } from 'react-dom';
import generateOutsideCheck from './generateOutsideCheck';

/**
 * A higher-order-component for handling onClickOutside for React components.
 */
const registeredComponents = [];
const handlers = [];

const touchEvents = ['touchstart', 'touchmove'];
export const IGNORE_CLASS_NAME = 'ignore-react-onclickoutside';

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
      excludeScrollbar: (config && config.excludeScrollbar) || false,
      outsideClickIgnoreClass: (config && config.outsideClickIgnoreClass) || IGNORE_CLASS_NAME,
      preventDefault: false,
      stopPropagation: false,
    };

    static getClass = () => (WrappedComponent.getClass ? WrappedComponent.getClass() : WrappedComponent);

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

    // this is given meaning in componentDidMount/componentDidUpdate
    __outsideClickHandler = null;

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

      if (config && typeof config.handleClickOutside === 'function') {
        this.__clickOutsideHandlerProp = config.handleClickOutside(instance);
        if (typeof this.__clickOutsideHandlerProp !== 'function') {
          throw new Error(
            'WrappedComponent lacks a function for processing outside click events specified by the handleClickOutside config option.',
          );
        }
      } else if (typeof instance.handleClickOutside === 'function') {
        if (Component.prototype.isPrototypeOf(instance)) {
          this.__clickOutsideHandlerProp = instance.handleClickOutside.bind(instance);
        } else {
          this.__clickOutsideHandlerProp = instance.handleClickOutside;
        }
      } else if (typeof instance.props.handleClickOutside === 'function') {
        this.__clickOutsideHandlerProp = instance.props.handleClickOutside;
      } else {
        throw new Error(
          'WrappedComponent lacks a handleClickOutside(event) function for processing outside click events.',
        );
      }

      // TODO: try to get rid of this, could be done with function ref, might be problematic for SFC though, they do not expose refs
      if (findDOMNode(instance) === null) {
        return;
      }

      this.addOutsideClickHandler();
    }

    /**
    * Track for disableOnClickOutside props changes and enable/disable click outside
    */
    componentWillReceiveProps(nextProps) {
      if (this.props.disableOnClickOutside && !nextProps.disableOnClickOutside) {
        this.enableOnClickOutside();
      } else if (!this.props.disableOnClickOutside && nextProps.disableOnClickOutside) {
        this.disableOnClickOutside();
      }
    }

    componentDidUpdate() {
      const componentNode = findDOMNode(this.getInstance());

      if (componentNode === null && this.__outsideClickHandler) {
        this.removeOutsideClickHandler();
        return;
      }

      if (componentNode !== null && !this.__outsideClickHandler) {
        this.addOutsideClickHandler();
        return;
      }
    }

    /**
     * Remove all document's event listeners for this component
     */
    componentWillUnmount() {
      this.removeOutsideClickHandler();
    }

    /**
     * Can be called to explicitly enable event listening
     * for clicks and touches outside of this element.
     */
    enableOnClickOutside = () => {
      const fn = this.__outsideClickHandler;
      if (fn && typeof document !== 'undefined') {
        let events = this.props.eventTypes;
        if (!events.forEach) {
          events = [events];
        }

        events.forEach(eventName => {
          let handlerOptions = null;
          const isTouchEvent = touchEvents.indexOf(eventName) !== -1;

          if (isTouchEvent) {
            handlerOptions = { passive: !this.props.preventDefault };
          }

          document.addEventListener(eventName, fn, handlerOptions);
        });
      }
    };

    /**
     * Can be called to explicitly disable event listening
     * for clicks and touches outside of this element.
     */
    disableOnClickOutside = () => {
      const fn = this.__outsideClickHandler;
      if (fn && typeof document !== 'undefined') {
        let events = this.props.eventTypes;
        if (!events.forEach) {
          events = [events];
        }
        events.forEach(eventName => document.removeEventListener(eventName, fn));
      }
    };

    addOutsideClickHandler() {
      const fn = (this.__outsideClickHandler = generateOutsideCheck(
        findDOMNode(this.getInstance()),
        this.__clickOutsideHandlerProp,
        this.props.outsideClickIgnoreClass,
        this.props.excludeScrollbar,
        this.props.preventDefault,
        this.props.stopPropagation,
      ));

      const pos = registeredComponents.length;
      registeredComponents.push(this);
      handlers[pos] = fn;

      // If there is a truthy disableOnClickOutside property for this
      // component, don't immediately start listening for outside events.
      if (!this.props.disableOnClickOutside) {
        this.enableOnClickOutside();
      }
    }

    removeOutsideClickHandler() {
      this.disableOnClickOutside();
      this.__outsideClickHandler = false;

      var pos = registeredComponents.indexOf(this);

      if (pos > -1) {
        // clean up so we don't leak memory
        if (handlers[pos]) {
          handlers.splice(pos, 1);
        }
        registeredComponents.splice(pos, 1);
      }
    }

    getRef = ref => (this.instanceRef = ref);

    /**
     * Pass-through render
     */
    render() {
      var props = Object.keys(this.props).filter(prop => prop !== 'excludeScrollbar').reduce((props, prop) => {
        props[prop] = this.props[prop];
        return props;
      }, {});

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
