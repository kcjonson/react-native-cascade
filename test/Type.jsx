import React, {Component} from 'react';
import {View, Text} from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';

/* eslint-disable react/prefer-stateless-function, class-methods-use-this */
export default class StringComponent extends Component {

  getComputestyleRuntime() {
    return computeStyle; // eslint-disable-line no-undef
  }

  render() {
    return (
      <View>
        <Text test-id="base">Hello</Text>
        <View test-id="unmatched" />
      </View>);
  }
}
