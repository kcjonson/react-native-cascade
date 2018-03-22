import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import StringComponent from './StringComponent';


/*

  These tests check the usage of <* className="*"> as a string property

*/


it('matches the snapshot for a string className attribute', () => {
  const tree = renderer
    .create(<StringComponent />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('creates a style node with appropriate style for a string className attribute', () => {
  const com = shallow(<StringComponent />);
  const hasStylesNode = com.find({'test-id': 'base'});
  expect(JSON.stringify(hasStylesNode.prop('style'))).toBe(JSON.stringify({
    color: 'red',
    backgroundColor: 'chartreuse',
    fontSize: 24,
  }));
});

it('matches mutliple classname selectors', () => {
  const com = shallow(<StringComponent />);
  const hasStylesNode = com.find({'test-id': 'mutliple-selector'});
  expect(JSON.stringify(hasStylesNode.prop('style'))).toBe(JSON.stringify({
    color: 'green',
    fontSize: 32,
    backgroundColor: 'chartreuse',
  }));
});


it('will add (merge) to an existing style definition for a string className attribute', () => {
  const com = shallow(<StringComponent />);
  ['style-object', 'style-object-reverse'].forEach(testId => {
    const hasStylesNode = com.find({'test-id': testId});
    expect(JSON.stringify(hasStylesNode.prop('style'))).toBe(JSON.stringify([
      {
        color: 'red',
        backgroundColor: 'chartreuse',
        fontSize: 24,
      }, {
        color: 'pink',
      },
    ]));
  });
});

it('will add (merge) to an existing style definition that is an array for a string className attribute', () => {
  const com = shallow(<StringComponent />);
  const hasStylesNode = com.find({'test-id': 'style-unmatched'});
  expect(JSON.stringify(hasStylesNode.prop('style'))).toBe('[null,{"backgroundColor":"pink"}]');
});

// These are tests for build time optimizations that are currently turned off.

// it("doesn't add to style tags for string className attributes with unmatched selectors", () => {
//   const com = shallow(<StringComponent />);
//   const hasStylesNode = com.find({'test-id': 'unmatched'});
//   expect(hasStylesNode.prop('style')).toBeUndefined();
// });
//
// it("doesn't create style tags for string className attributes with unmatched selectors", () => {
//   const com = shallow(<StringComponent />);
//   const hasStylesNode = com.find({'test-id': 'unmatched'});
//   expect(hasStylesNode.prop('style')).toBeUndefined();
// });

// it('doesnt have the runtime when not needed', () => {
//   const com = shallow(<StringComponent />);
//   expect(() => {
//     com.instance().getComputestyleRuntime();
//   }).toThrowError();
// });

// TODO: expect a warning at build time if a style is undec
