import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';


export default class BasicComponent extends Component {
  render() {
    return <Text className='text-large container'>Hello</Text>
  }
}
