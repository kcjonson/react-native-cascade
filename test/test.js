import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import BasicComponent from './BasicComponent';

it('renders correctly', () => {
  const tree = renderer
    .create(<BasicComponent />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
