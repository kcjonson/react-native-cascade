import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import VariableComponent from './VariableComponent';
import VariableComponentUndeclaredStyle from './VariableComponentUndeclaredStyle';

it('renders correctly', () => {
  const tree = renderer
    .create(<VariableComponent />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('has the computestyle runtime', () => {
  const com = shallow(<VariableComponent />);
  const computestyleRuntime = com.instance().getComputestyleRuntime();
  expect(computestyleRuntime).toBeDefined();
});

it('warns about ummatched classnames at runtime', () => {
  const spy = {};
  spy.console = jest.spyOn(global.console, 'warn').mockImplementation(() => {});
  shallow(<VariableComponentUndeclaredStyle />);
  expect(console.warn).toBeCalled(); // eslint-disable-line no-console
  spy.console.mockRestore();
});
