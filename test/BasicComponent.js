import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

// import './stylesheet_1';
// import './stylesheet_2';

import stylesheet_1 from './stylesheet_1';
import stylesheet_2 from './stylesheet_2';
const stylesheetsOrdered = [stylesheet_1, stylesheet_2];


export default class BasicComponent extends Component {
  render() {
    var bar = [1, 2, 3];
    return <Text className='text-large container'>Hello</Text>
  }
}
