import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import wrapComponent from '../';

describe('onclickoutside hoc', function() {
  class Component extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        clickOutsideHandled: false,
        timesHandlerCalled: 0,
      };
    }

    toggleEnableClickOutside(on) {
      if (on) {
        this.props.enableOnClickOutside();
      } else {
        this.props.disableOnClickOutside();
      }
    }

    handleClickOutside(event) {
      if (event === undefined) {
        throw new Error('event cannot be undefined');
      }

      this.setState({
        clickOutsideHandled: true,
        timesHandlerCalled: this.state.timesHandlerCalled + 1,
      });
    }

    render() {
      return React.createElement('div');
    }
  }

  var WrappedComponent = wrapComponent(Component, {
    handleClickOutside(instance) {
      return function(event) {
        instance.handleClickOutside(event);
      };
    }
  });

  // tests

  it('should call handleClickOutside when clicking the document', function() {
    var element = React.createElement(WrappedComponent);
    assert(element, 'element can be created');
    var component = TestUtils.renderIntoDocument(element);
    assert(component, 'component renders correctly');
    document.dispatchEvent(new Event('mousedown'));
    var instance = component.getInstance();
    assert(instance.state.clickOutsideHandled, 'clickOutsideHandled got flipped');
  });

  it('should throw an error when a component without handleClickOutside(evt) is wrapped', function() {
    class BadComponent extends React.Component {
      render() {
        return React.createElement('div');
      }
    }

    try {
      wrapComponent(BadComponent);
      assert(false, 'component was wrapped, despite not implementing handleClickOutside(evt)');
    } catch (e) {
      assert(e, 'component was not wrapped');
    }
  });

  describe('with instance method', function() {
    it('and class inheritance, should call the specified handler when clicking the document', function() {
      class Component extends React.Component {
        constructor(...args) {
          super(...args);
          this.state = {
            clickOutsideHandled: false,
          };
        }

        handleClickOutside(event) {
          if (event === undefined) {
            throw new Error('event cannot be undefined');
          }

          this.setState({
            clickOutsideHandled: true,
          });
        }

        render() {
          return React.createElement('div');
        }
      }

      var WrappedWithCustomHandler = wrapComponent(Component);

      var element = React.createElement(WrappedWithCustomHandler);
      assert(element, 'element can be created');
      var component = TestUtils.renderIntoDocument(element);
      assert(component, 'component renders correctly');
      document.dispatchEvent(new Event('mousedown'));
      var instance = component.getInstance();
      assert(instance.state.clickOutsideHandled, 'clickOutsideHandled got flipped');
    });

    it('and createClass method, should call the specified handler when clicking the document', function() {
      class Component extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            clickOutsideHandled: false,
          };
        }

        handleClickOutside(event) {
          if (event === undefined) {
            throw new Error('event cannot be undefined');
          }

          this.setState({
            clickOutsideHandled: true,
          });
        }

        render() {
          return React.createElement('div');
        }
      }

      var WrappedWithCustomHandler = wrapComponent(Component);

      var element = React.createElement(WrappedWithCustomHandler);
      assert(element, 'element can be created');
      var component = TestUtils.renderIntoDocument(element);
      assert(component, 'component renders correctly');
      document.dispatchEvent(new Event('mousedown'));
      var instance = component.getInstance();
      assert(instance.state.clickOutsideHandled, 'clickOutsideHandled got flipped');
    });
  });

  describe('with property', function() {
    it('and class inheritance, should call the specified handler when clicking the document', function() {
      class Component extends React.Component {
        render() {
          return React.createElement('div');
        }
      }

      var clickOutsideHandled = false;
      var handleClickOutside = function(event) {
        if (event === undefined) {
          throw new Error('event cannot be undefined');
        }

        clickOutsideHandled = true;
      };

      var WrappedWithCustomHandler = wrapComponent(Component);

      var element = React.createElement(WrappedWithCustomHandler, { handleClickOutside: handleClickOutside });
      assert(element, 'element can be created');
      var component = TestUtils.renderIntoDocument(element);
      assert(component, 'component renders correctly');
      document.dispatchEvent(new Event('mousedown'));
      assert(clickOutsideHandled, 'clickOutsideHandled got flipped');
    });

    it('and createClass method, should call the specified handler when clicking the document', function() {
      class Component extends React.Component {
        render() {
          return React.createElement('div');
        }
      }

      var clickOutsideHandled = false;
      var handleClickOutside = function(event) {
        if (event === undefined) {
          throw new Error('event cannot be undefined');
        }

        clickOutsideHandled = true;
      };

      var WrappedWithCustomHandler = wrapComponent(Component);

      var element = React.createElement(WrappedWithCustomHandler, { handleClickOutside: handleClickOutside });
      assert(element, 'element can be created');
      var component = TestUtils.renderIntoDocument(element);
      assert(component, 'component renders correctly');
      document.dispatchEvent(new Event('mousedown'));
      assert(clickOutsideHandled, 'clickOutsideHandled got flipped');
    });

    it('and stateless function, should call the specified handler when clicking the document', function() {
      var Component = function() {
        return React.createElement('div');
      };

      var clickOutsideHandled = false;
      var handleClickOutside = function(event) {
        if (event === undefined) {
          throw new Error('event cannot be undefined');
        }

        clickOutsideHandled = true;
      };

      var WrappedWithCustomHandler = wrapComponent(Component);

      var element = React.createElement(WrappedWithCustomHandler, { handleClickOutside: handleClickOutside });
      assert(element, 'element can be created');
      var component = TestUtils.renderIntoDocument(element);
      assert(component, 'component renders correctly');
      document.dispatchEvent(new Event('mousedown'));
      assert(clickOutsideHandled, 'clickOutsideHandled got flipped');
    });
  });

  it('should throw an error when a custom handler is specified, but the component does not implement it', function() {
    class BadComponent extends React.Component {
      render() {
        return React.createElement('div');
      }
    }

    try {
      wrapComponent(BadComponent, {
        handleClickOutside: function(instance) {
          return instance.nonExistentMethod;
        },
      });
      assert(false, 'component was wrapped, despite not implementing the custom handler');
    } catch (e) {
      assert(e, 'component was not wrapped');
    }
  });

  it('should not call handleClickOutside if this.props.disableOnClickOutside() is called, until this.props.enableOnClickOutside() is called.', function() {
    var element = React.createElement(WrappedComponent);
    var component = TestUtils.renderIntoDocument(element);
    document.dispatchEvent(new Event('mousedown'));
    var instance = component.getInstance();
    assert(instance.state.timesHandlerCalled === 1, 'handleClickOutside called');

    try {
      instance.toggleEnableClickOutside(false);
    } catch (error) {
      assert(false, 'this.props.disableOnClickOutside() should not be undefined.');
    }

    document.dispatchEvent(new Event('mousedown'));
    assert(instance.state.timesHandlerCalled === 1, 'handleClickOutside not called after disableOnClickOutside()');

    instance.toggleEnableClickOutside(true);
    document.dispatchEvent(new Event('mousedown'));
    assert(instance.state.timesHandlerCalled === 2, 'handleClickOutside called after enableOnClickOutside()');
  });

  it('should fallback to call component.props.handleClickOutside when no component.handleClickOutside is defined', function() {
    var StatelessComponent = () => React.createElement('div');
    var clickOutsideHandled = false;
    var WrappedStatelessComponent = wrapComponent(StatelessComponent);
    var element = React.createElement(WrappedStatelessComponent, {
      handleClickOutside: function(event) {
        if (event === undefined) {
          throw new Error('event cannot be undefined');
        }

        clickOutsideHandled = true;
      },
    });

    assert(element, 'element can be created');
    var component = TestUtils.renderIntoDocument(element);
    assert(component, 'component renders correctly');
    document.dispatchEvent(new Event('mousedown'));
    component.getInstance();
    assert(clickOutsideHandled, 'clickOutsideHandled got flipped');
  });

  it('should register only one click outside listener per instance', function() {
    var i = 0;

    var Component = wrapComponent(class extends React.Component {
      componentDidMount() {
        this.props.enableOnClickOutside();
      }

      handleClickOutside() {
        ++i;
      }

      render() {
        return React.createElement('div');
      }
    });

    TestUtils.renderIntoDocument(React.createElement(Component));
    document.dispatchEvent(new Event('mousedown'));
    assert(i === 1, 'listener called only once');
  });

  describe('with child rendering as null', function() {
    var counter;

    beforeEach(function () {
      counter = 0;
    });

    it('shouldn\'t throw an error when wrapped SFC renders as null', function() {
      var StatelessComponent = () => null;
      try {
        wrapComponent(StatelessComponent);
        assert(true, 'component was wrapped despite having no DOM node on mount');
      } catch (err) {
        assert(false, 'an error was thrown');
      }
    });

    class ClassComponent extends React.Component {
      handleClickOutside() {
        counter++;
      }
      componentDidUpdate() {
        this.props.callDisableOnClickOutside && this.props.disableOnClickOutside();
        this.props.callEnableOnClickOutside && this.props.enableOnClickOutside();
      }
      render() {
        return this.props.renderNull ? null : React.createElement('div');
      }
    }

    var container = document.createElement('div');
    var WrappedComponent = wrapComponent(ClassComponent);

    const rerender = function(props) {
      return ReactDOM.render(React.createElement(WrappedComponent, props), container);
    };

    it('should render fine when wrapped component renders as null', function() {
      var component = rerender({ renderNull: true });
      assert(component, 'component was wrapped despite having no DOM node on mount');
      document.dispatchEvent(new Event('mousedown'));
      assert(counter === 0, 'should not fire handleClickOutside when having no DOM node');
    });

    it('should attach and deattach event listener on updates', function() {
      rerender({ renderNull: false });
      document.dispatchEvent(new Event('mousedown'));
      assert(counter === 1, 'should fire handleClickOutside when DOM node gets created after rerender');

      rerender({ renderNull: true });
      document.dispatchEvent(new Event('mousedown'));
      assert(counter === 1, 'should stop firing handleClickOutside when DOM node gets removed');
    });

    it('should handle disabling and enabling onClickOutside listener when having no DOM node', function() {
      rerender({ renderNull: true, callEnableOnClickOutside: true });
      document.dispatchEvent(new Event('mousedown'));
      assert(
        counter === 0,
        'should not call handleClickOutside when onClickOutside gets enabled when having no DOM node',
      );

      rerender({ renderNull: true, callDisableOnClickOutside: true });
      document.dispatchEvent(new Event('mousedown'));
      assert(
        counter === 0,
        'should not call handleClickOutside when onClickOutside gets disabled when having no DOM node',
      );
    });
  });
});
