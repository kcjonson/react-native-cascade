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

it('creates a style node with appropriate style', () => {
  const com = shallow(<BasicComponent />);
  const hasStylesNode = com.find({className: 'text-large container'});
  expect(hasStylesNode.prop('style')).toMatchObject({color: 'red', fontSize: 24});
});

it("doesn't create style tags for nodes with unmatched selectors", () => {
  const com = shallow(<BasicComponent />);
  const hasStylesNode = com.find({className: 'text-medium'});
  expect(hasStylesNode.prop('style')).toBeUndefined();
});

it('doesnt have the runtime when not needed', () => {
  const com = shallow(<BasicComponent />);
  expect(() => {
    com.instance().getComputestyleRuntime();
  }).toThrowError();
});

// TODO: expect a warning at build time if a style is undec
