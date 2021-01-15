import React, { createElement as e } from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { spy } from 'sinon';

import { useOnClickOutside } from '../';

const TestComponent = props => {
  const { domRef, ...onClickOutsideProps } = useOnClickOutside(props);
  return e('div', { ...onClickOutsideProps, ref: domRef });
};

describe('onclickoutside hoc', function() {
  // tests

  it('should call handleClickOutside when clicking the document', function() {
    const clickSpy = spy();
    var element = React.createElement(TestComponent, { onClickOutside: clickSpy });
    assert(element, 'element can be created');
    var component = TestUtils.renderIntoDocument(element);
    assert(component, 'component renders correctly');
    document.dispatchEvent(new Event('mousedown'));
    assert(clickSpy.called, 'onClickOutside was called');
  });

  it.only('should not call handleClickOutside if this.props.disableOnClickOutside() is called, until this.props.enableOnClickOutside() is called.', function() {
    const clickSpy = spy();
    var element = React.createElement(TestComponent, { onClickOutside: clickSpy });
    var component = TestUtils.renderIntoDocument(element);
    document.dispatchEvent(new Event('mousedown'));
    assert(spy.callCount === 1, 'handleClickOutside called');

    try {
      console.log(element);
      element.props.disableOnClickOutside();
    } catch (error) {
      console.log(error);
      assert(false, 'this.props.disableOnClickOutside() should not be undefined.');
    }

    document.dispatchEvent(new Event('mousedown'));
    assert(spy.callCount === 1, 'handleClickOutside not called after disableOnClickOutside()');

    element.props.enableOnClickOutside();
    document.dispatchEvent(new Event('mousedown'));
    assert(spy.callCount === 2, 'handleClickOutside called after enableOnClickOutside()');
  });

  /*

  it('should fallback to call component.props.handleClickOutside when no component.handleClickOutside is defined', function() {
    var StatelessComponent = () => React.createElement('div');
    var clickOutsideHandled = false;
    var WrappedStatelessComponent = withOnClickOutside(StatelessComponent);
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

    var Component = withOnClickOutside(
      class extends React.Component {
        componentDidMount() {
          this.props.enableOnClickOutside();
        }

        handleClickOutside() {
          ++i;
        }

        render() {
          return React.createElement('div');
        }
      },
    );

    TestUtils.renderIntoDocument(React.createElement(Component));
    document.dispatchEvent(new Event('mousedown'));
    assert(i === 1, 'listener called only once');
  });

  describe('with child rendering as null', function() {
    var counter;

    beforeEach(function() {
      counter = 0;
    });

    it('shouldn\'t throw an error when wrapped SFC renders as null', function() {
      var StatelessComponent = () => null;
      try {
        withOnClickOutside(StatelessComponent);
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
    var WrappedComponent = withOnClickOutside(ClassComponent);

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

  describe('with advanced settings disableOnclickOutside', function() {
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

    it('disableOnclickOutside as true should not call handleClickOutside', function() {
      var component = TestUtils.renderIntoDocument(
        React.createElement(withOnClickOutside(Component), { disableOnClickOutside: true }),
      );
      document.dispatchEvent(new Event('mousedown'));
      var instance = component.getInstance();
      assert(instance.state.clickOutsideHandled === false, 'clickOutsideHandled should not get flipped');
    });

    it('disableOnclickOutside as true should not call handleClickOutside until enableOnClickOutside is called', function() {
      var component = TestUtils.renderIntoDocument(
        React.createElement(withOnClickOutside(Component), { disableOnClickOutside: true }),
      );
      var instance = component.getInstance();
      document.dispatchEvent(new Event('mousedown'));
      assert(instance.state.clickOutsideHandled === false, 'clickOutsideHandled should not get flipped');

      instance.props.enableOnClickOutside();
      document.dispatchEvent(new Event('mousedown'));
      assert(instance.state.clickOutsideHandled === true, 'clickOutsideHandled should not get flipped');
    });
  });

  describe('with setClickOutsideRef configured instead of findDOMNode', function() {
    class Component extends React.Component {
      callbackCalled = false;
      clickOutsideRef = null;

      handleClickOutside() {}

      setClickOutsideRef() {
        this.callbackCalled = true;
        return this.clickOutsideRef;
      }

      render() {
        return React.createElement('div', {
          ref: c => {
            this.clickOutsideRef = c;
          },
        });
      }
    }

    it('uses the DOM node defined by setClickOutsideRef in a class', function() {
      var component = TestUtils.renderIntoDocument(React.createElement(withOnClickOutside(Component)));
      document.dispatchEvent(new Event('mousedown'));
      var instance = component.getInstance();
      assert(instance.callbackCalled === true, 'setClickOutsideRef was called in class component');
    });

    let callbackCalled = false;
    let ref = null;
    function FuncComponent() {
      FuncComponent.setClickOutsideRef = () => {
        callbackCalled = true;
        return ref;
      };
      return React.createElement('div', {
        ref: c => {
          ref = c;
        },
      });
    }

    it('uses the DOM node defined by setClickOutsideRef in a function', function() {
      TestUtils.renderIntoDocument(
        React.createElement(
          withOnClickOutside(FuncComponent, {
            setClickOutsideRef: () => FuncComponent.setClickOutsideRef,
            handleClickOutside: () => () => {},
          }),
        ),
      );
      document.dispatchEvent(new Event('mousedown'));

      assert(callbackCalled === true, 'setClickOutsideRef was called in function component');
    });
  });
  */
});
