import React, { Component } from 'react';
import { Text } from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';

/* eslint-disable react/prefer-stateless-function */
export default class BasicComponent extends Component {
  render() {
    const styles = 'text-large container';
    return <Text className={styles}>Hello</Text>;
  }
}
