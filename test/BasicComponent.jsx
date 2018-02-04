import React, { Component } from 'react';
import { Text } from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';

/* eslint-disable react/prefer-stateless-function */
export default class BasicComponent extends Component {
  render() {
    return <Text className="text-large container">Hello</Text>;
  }
}
