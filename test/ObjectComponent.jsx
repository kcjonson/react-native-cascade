import React, {Component} from 'react';
import {View, Text} from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';

/* eslint-disable react/prefer-stateless-function, class-methods-use-this */
export default class ObjectComponent extends Component {

  getComputestyleRuntime() {
    return computeStyle; // eslint-disable-line no-undef
  }

  render() {
    const styles = 'text-large container';
    return (
      <View>
        <Text className={styles} test-id="base">Hello</Text>
        <Text className={styles} style={{color: 'pink'}} test-id="style-object">Hello</Text>
        <Text className={styles} style={[{color: 'pink'}]} test-id="style-array">Hello</Text>
      </View>);
  }
}
