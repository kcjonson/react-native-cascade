import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import BasicComponent from './BasicComponent';

it('matches the snapshot', () => {
  const tree = renderer
    .create(<BasicComponent />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('creates a style node', () => {
  const com = shallow(<BasicComponent />);
  const hasStylesNode = com.find({className: 'text-large container'});
  expect(hasStylesNode.prop('style')).toMatchObject({color: 'red', fontSize: 24});
});

it("doesn't create style tags for nodes with unmatched selectors", () => {
  const com = shallow(<BasicComponent />);
  const hasStylesNode = com.find({className: 'text-medium'});
  expect(hasStylesNode.prop('style')).toBeUndefined();
});


// TODO: Test to make sure the runtime isn't included when its not needed
