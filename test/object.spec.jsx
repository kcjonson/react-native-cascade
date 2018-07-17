import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import ObjectComponent from './ObjectComponent';
// import ObjectComponentUndeclaredStyle from './ObjectComponentUndeclaredStyle';


/*

  These tests check the usage of <* className={*}> as an object property

  Note: These run the computestyle() function, so the toMatchObject is what is
        expected from the actual runtime. This differs from what you'll see as
        the string output from babel if you're looking at code!

        In code you'll see:

        React.createElement(
          Text,
          { className: styles, 'test-id': 'base', style: computeStyle(styles, _stylesheets)
          },
          'Hello'
        ),

        but these tests are not looking for
        .toMatchObject(computeStyle(styles, _stylesheets));
        they are actually looking at the final output (which is good)

*/


it('matches the snapshot for for an object className attribute', () => {
  const tree = renderer
    .create(<ObjectComponent />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('has the computestyle runtime for an object className attribute', () => {
  const com = shallow(<ObjectComponent />);
  const computestyleRuntime = com.instance().getComputestyleRuntime();
  expect(computestyleRuntime).toBeDefined();
});

it('creates a style node with appropriate style for an object className attribute', () => {
  const com = shallow(<ObjectComponent />);
  const hasStylesNode = com.find({'test-id': 'base'});
  expect(JSON.stringify(hasStylesNode.prop('style'))).toBe(JSON.stringify({
    color: 'red',
    fontSize: 24,
    backgroundColor: 'chartreuse',
    paddingTop: 16,
  }));
});

it('will add (merge) to an existing style definition that is an object for a object className attribute', () => {
  const com = shallow(<ObjectComponent />);
  const hasStylesNode = com.find({'test-id': 'style-object'});
  expect(JSON.stringify(hasStylesNode.prop('style'))).toBe(JSON.stringify([
    {
      color: 'red',
      fontSize: 24,
      backgroundColor: 'chartreuse',
      paddingTop: 16,
    }, {
      color: 'pink',
    },
  ]));
});

it('will add (merge) to an existing style definition that is an array for a object className attribute', () => {
  const com = shallow(<ObjectComponent />);
  const hasStylesNode = com.find({'test-id': 'style-array'});
  expect(JSON.stringify(hasStylesNode.prop('style'))).toBe(JSON.stringify([
    {
      color: 'red',
      fontSize: 24,
      backgroundColor: 'chartreuse',
      paddingTop: 16,
    },
    [{color: 'pink'}],
  ]));
});

// This is really log cluttering, so its currently turned off.

// it('warns about ummatched classnames at runtime for an object className attribute', () => {
//   const spy = {};
//   spy.console = jest.spyOn(global.console, 'warn').mockImplementation(() => {});
//   shallow(<ObjectComponentUndeclaredStyle />);
//   expect(console.warn).toBeCalled(); // eslint-disable-line no-console
//   spy.console.mockRestore();
// });
