# react-native-cascade 

[![Travis Status](https://travis-ci.org/kcjonson/react-native-cascade.svg?branch=master)]() [![npm](https://img.shields.io/npm/v/npm.svg)]()


react-native cascade is a Babel plugin that will pair css declarations in imported stylesheets with nodes matching their selectors in JSX, automatically. 

### Goals
- Reduce boilerplate and unnecessary dev effort caused by manually pairing React Native stylesheets with JSX nodes
- Feels like writing styles on web as much as possible and uses web style cascade priorities
-  Automatically pairs any css selectors from an imported stylesheet to nodes in a JSX template without any manual steps
- Does not create global scope, all styles remain tightly bound to the component importing them
- Usable with any utility that would create classname strings such as classnames

<br />
### Installation

```Shell
npm install babel-preset-react-native-cascade --save-dev
```

add it to the plugins list in your `.babelrc` 

```JSON
{
  "presets": ["env", "react-native"],
  "plugins": ["babel-preset-react-native-cascade"]
}
```
<br />
### What it does

**Example.jsx**
```Javascript
import React, { Component } from 'react';
import { Text } from 'react-native';

import './Example.css';

export default class Example extends Component {
  render() {
    return <Text className="text-large container">Hello</Text>;
  }
}
```

**Example.css**
```
module.exports = [
  ['container', [
    ['color', 'green']
  ]],
  ['text-large', [
    ['fontSize', 24],
    ['color', 'red']
  ]]
]
```

after the 

```
import React, { Component } from 'react';
import { Text } from 'react-native';

import _stylesheet from './styles.css';
const _stylesheets = [_stylesheet];

export default class Example extends Component {
  render() {
    return <Text className="text-large container" styles={computeStyle("text-large container", _stylesheets)}>Hello</Text>
  }
}


function computeStyle(classNames, stylesheets) {...}
```
