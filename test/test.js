var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var wrapComponent = require('../index');

describe('onclickoutside hoc', function() {

  var Component = React.createClass({
    getInitialState: function() {
      return {
        clickOutsideHandled: false
      };
    },

    handleClickOutside: function(event) {
      if (event === undefined) {
          throw new Error("event cannot be undefined");
      }

      this.setState({
        clickOutsideHandled: true
      });
    },

    render: function() {
      return React.createElement('div');
    }
  });

  var BadComponent = React.createClass({
    render: function() {
      return React.createElement('div');
    }
  });

  var CustomComponent = React.createClass({
    getInitialState: function() {
      return {
        clickOutsideHandled: false
      };
    },

    myOnClickHandler: function(event) {
      if (event === undefined) {
          throw new Error("event cannot be undefined");
      }

      this.setState({
        clickOutsideHandled: true
      });
    },

    render: function() {
      return React.createElement('div');
    }
  });

  // tests

  it('should call handleClickOutside when clicking the document', function() {
    var WrappedComponent = wrapComponent()(Component);
    var element = React.createElement(WrappedComponent);
    assert(element, "element can be created");
    var component = TestUtils.renderIntoDocument(element);
    assert(component, "component renders correctly");
    document.dispatchEvent(new Event('mousedown'));
    var instance = component.getInstance();
    assert(instance.state.clickOutsideHandled, "clickOutsideHandled got flipped");
  });

  it('should throw an error when a component without handleClickOutside(evt) is wrapped', function() {
    try {
      var bad = wrapComponent()(BadComponent);
      assert(false, "component was wrapped, despite not implementing handleClickOutside(evt)");
    } catch (e) {
      assert(e, "component was not wrapped");
    }
  });

  it('should call handleClickOutside when clicking the document using the legacy call convention', function() {
    var element = React.createElement(wrapComponent(Component));
    assert(element, "element can be created");
    var component = TestUtils.renderIntoDocument(element);
    assert(component, "component renders correctly");
    document.dispatchEvent(new Event('mousedown'));
    var instance = component.getInstance();
    assert(instance.state.clickOutsideHandled, "clickOutsideHandled got flipped");
  });

  it('should throw an error when a component without handleClickOutside(evt) is wrapped using legacy call convention', function() {
    try {
      var bad = wrapComponent(BadComponent);
      assert(false, "component was wrapped, despite not implementing handleClickOutside(evt)");
    } catch (e) {
      assert(e, "component was not wrapped");
    }
  });

  it('should call the specified handler when clicking the document', function() {
    var WrappedWithCustomHandler = wrapComponent({
      onClickOutside: function(instance) {
        return instance.myOnClickHandler;
      }
    })(CustomComponent);

    var element = React.createElement(WrappedWithCustomHandler);
    assert(element, "element can be created");
    var component = TestUtils.renderIntoDocument(element);
    assert(component, "component renders correctly");
    document.dispatchEvent(new Event('mousedown'));
    var instance = component.getInstance();
    assert(instance.state.clickOutsideHandled, "clickOutsideHandled got flipped");
  });

  it('should throw an error when a custom handler is specified, but the component does not implement it', function() {
    var BadComponent = React.createClass({
      render: function() {
        return React.createElement('div');
      }
    });

    try {
      var bad = wrapComponent({
        onClickOutside: function(instance){
          return instance.nonExistentMethod;
        }
      })(BadComponent);
      assert(false, "component was wrapped, despite not implementing the custom handler");
    } catch (e) {
      assert(e, "component was not wrapped");
    }
  });

  it('should allow for partial application', function() {
    var partiallyAppliedWrapper = wrapComponent({
      onClickOutside: function(instance) {
        return instance.myOnClickHandler;
      }
    });

    var WrappedWithCustomHandler = partiallyAppliedWrapper(CustomComponent);

    var element = React.createElement(WrappedWithCustomHandler);
    assert(element, "element can be created");
    var component = TestUtils.renderIntoDocument(element);
    assert(component, "component renders correctly");
    document.dispatchEvent(new Event('mousedown'));
    var instance = component.getInstance();
    assert(instance.state.clickOutsideHandled, "clickOutsideHandled got flipped");
  });
});
