import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';

export default class BasicComponent extends Component {
  render() {
    const styles = 'text-large container'
    return <Text className={styles}>Hello</Text>
  }
}
