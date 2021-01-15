'use strict';
var assert = require('assert');
var React = require('react');
var renderer = require('react-test-renderer');
var useOnClickOutside = require('../').useOnClickOutside;

const TestComponent = props => {
  const { domRef, ...onClickOutsideProps } = useOnClickOutside(props);
  return React.createElement('div', { ...onClickOutsideProps, ref: domRef });
};

describe('onclickoutside hook with no DOM', function() {
  it('should not throw an error if rendered in an environment with no DOM', function() {
    const element = React.createElement(TestComponent);
    assert(element, 'element can be created');
    const renderInstance = renderer.create(element);
    assert(renderInstance.toJSON().type === 'div', 'wrapped component renders a div');
  });
});
