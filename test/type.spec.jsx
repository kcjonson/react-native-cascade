import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import Type from './Type';


it('matches the snapshot for a string type attribute', () => {
  const tree = renderer
    .create(<Type />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('creates a style node with appropriate style for a type attribute', () => {
  const com = shallow(<Type />);
  const hasStylesNode = com.find({'test-id': 'base'});
  expect(JSON.stringify(hasStylesNode.prop('style'))).toBe(JSON.stringify({
    color: 'salmon',
    backgroundColor: 'chartreuse',
  }));
});
