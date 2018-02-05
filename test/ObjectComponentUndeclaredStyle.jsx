import React, {Component} from 'react';
import {View, Text} from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';

/* eslint-disable react/prefer-stateless-function */
export default class BasicComponent extends Component {
  render() {
    const stylesUndeclared = 'text-medium'; // does not exist in stylesheet
    return (
      <View>
        <Text className={stylesUndeclared}>World</Text>
      </View>);
  }
}
