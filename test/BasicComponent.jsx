import React, {Component} from 'react';
import {View, Text} from 'react-native';

import './stylesheet_1.css';
import './stylesheet_2.css';


/* eslint-disable react/prefer-stateless-function, class-methods-use-this */
export default class BasicComponent extends Component {

  getComputestyleRuntime() {
    return computeStyle; // eslint-disable-line no-undef
  }

  render() {
    return (
      <View>
        <Text className="text-large container">Hello</Text>
        <Text className="text-medium">World</Text>
      </View>);
  }
}

/*
<Text className="text-large container" style={{color: 'pink'}}>Hello</Text>
<Text className="text-medium" style={{color: 'pink'}}>World</Text>
*/
