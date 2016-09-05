var React = require('react');
var TestUtils = require('react-addons-test-utils');
var wrapComponent = require('../index');

describe('onclickoutside hoc', function() {

  var Component = React.createClass({
    getInitialState: function() {
      return {
        clickOutsideHandled: false,
        timesHandlerCalled: 0
      };
    },

    toggleEnableClickOutside: function(on) {
      if(on) {
        this.props.enableOnClickOutside();
      }
      else {
        this.props.disableOnClickOutside();
      }
    },

    handleClickOutside: function(event) {
      if (event === undefined) {
        throw new Error('event cannot be undefined');
      }

      this.setState({
        clickOutsideHandled: true,
        timesHandlerCalled: this.state.timesHandlerCalled + 1
      });
    },

    render: function() {
      return React.createElement('div');
    }
  });

  var WrappedComponent = wrapComponent(Component);

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
    var BadComponent = React.createClass({
      render: function() {
        return React.createElement('div');
      }
    });

    try {
      wrapComponent(BadComponent);
      assert(false, 'component was wrapped, despite not implementing handleClickOutside(evt)');
    } catch (e) {
      assert(e, 'component was not wrapped');
    }
  });


  it('should call the specified handler when clicking the document', function() {
    var Component = React.createClass({
      getInitialState: function() {
        return {
          clickOutsideHandled: false
        };
      },

      myOnClickHandler: function(event) {
        if (event === undefined) {
          throw new Error('event cannot be undefined');
        }

        this.setState({
          clickOutsideHandled: true
        });
      },

      render: function() {
        return React.createElement('div');
      }
    });

    var WrappedWithCustomHandler = wrapComponent(Component, {
      handleClickOutside: function (instance) {
        return instance.myOnClickHandler;
      }
    });

    var element = React.createElement(WrappedWithCustomHandler);
    assert(element, 'element can be created');
    var component = TestUtils.renderIntoDocument(element);
    assert(component, 'component renders correctly');
    document.dispatchEvent(new Event('mousedown'));
    var instance = component.getInstance();
    assert(instance.state.clickOutsideHandled, 'clickOutsideHandled got flipped');
  });


  it('should throw an error when a custom handler is specified, but the component does not implement it', function() {
    var BadComponent = React.createClass({
      render: function() {
        return React.createElement('div');
      }
    });

    try {
      wrapComponent(BadComponent, {
        handleClickOutside: function (instance) {
          return instance.nonExistentMethod;
        }
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
    }
    catch(error) {
      assert(false, 'this.props.disableOnClickOutside() should not be undefined.');
    }

    document.dispatchEvent(new Event('mousedown'));
    assert(instance.state.timesHandlerCalled === 1, 'handleClickOutside not called after disableOnClickOutside()');

    instance.toggleEnableClickOutside(true);
    document.dispatchEvent(new Event('mousedown'));
    assert(instance.state.timesHandlerCalled === 2, 'handleClickOutside called after enableOnClickOutside()');
  });
});
