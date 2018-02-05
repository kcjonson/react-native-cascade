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
        <Text className="text-large container" test-id="base">Hello</Text>
        <Text className="text-medium" test-id="unmatched">World</Text>
        <Text className="text-large container" style={{color: 'pink'}} test-id="style-object">Hello</Text>
        <Text className="text-large container" style={[{color: 'pink'}]} test-id="style-array">Hello</Text>
        <Text className="text-medium" style={{color: 'pink'}} test-id="style-unmatched">World</Text>
      </View>);
  }
}

/*


*/
